import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { Strategy, Vault, VaultStartegy } from '@prisma/client';
import { StrategyInfoResponse, StrategyVaultInfo } from '../../dto';

@Injectable()
export class StrategyService {
  constructor(private readonly db: DatabaseService) {}

  async getStrategiesInfo(userId: string): Promise<StrategyInfoResponse[]> {
    const strategies: Strategy[] = await this.getStrategies(userId);
    const info: StrategyInfoResponse[] = [];
    for (const strategy of strategies) {
      const strategyVaults = await this.getStrategiesVaults(strategy.id);
      info.push(
        this.mapStrategyDashboardInfoResponse(strategy, strategyVaults),
      );
    }
    return info;
  }

  async getStrategyInfo(strategyId: string): Promise<StrategyInfoResponse> {
    const strategy: Strategy = (
      await this.getStrategies(undefined, strategyId)
    )[0];
    const strategyVaults = await this.getStrategiesVaults(strategy.id);
    return this.mapStrategyDashboardInfoResponse(strategy, strategyVaults);
  }

  async createStrategy(
    userId: string,
    name: string,
    vaultDeposits: Record<string, number>,
  ) {
    try {
      const strategy = await this.db.strategy.create({
        data: { user_id: userId, name },
        select: { id: true },
      });
      await this.addStrategyVaults(strategy.id, vaultDeposits);
      return strategy;
    } catch (error) {
      console.error('Failed to create strategy:', error);
      return null;
    }
  }

  async deleteStrategy(strategyId: string): Promise<void> {
    await this.db.$transaction([
      this.db.vaultStartegy.deleteMany({
        where: { strategy_id: strategyId },
      }),
      this.db.strategy.delete({
        where: { id: strategyId },
      }),
    ]);
  }

  private async getStrategies(
    userId?: string,
    id?: string,
  ): Promise<Strategy[]> {
    return this.db.strategy.findMany({
      where: {
        ...(userId && { user_id: userId }),
        ...(id && { id: id }),
      },
    });
  }

  private async addStrategyVaults(
    strategyId: string,
    vaultDeposits: Record<string, number>,
  ) {
    try {
      for (const [vaultId, depositedAmount] of Object.entries(vaultDeposits)) {
        const vault = await this.db.vault.findUnique({
          where: {
            id: vaultId,
          },
        });
        const depositedAmountUsdt =
          depositedAmount * Number(vault.current_asset_price);
        const ownershipFraction =
          Number(vault.current_tvl) > 0
            ? Number(depositedAmountUsdt) / Number(vault.current_tvl)
            : 0;
        await this.db.vaultStartegy.create({
          data: {
            vault_id: vaultId,
            deposited_amount: depositedAmount,
            deposited_amount_usd: depositedAmountUsdt,
            strategy_id: strategyId,
            interest_earned: 0,
            interest_earned_usd: 0,
            ownership_fraction: ownershipFraction,
          },
        });
      }
    } catch (error) {
      console.error('Failed to create VaultStrategy:', error);
      return null;
    }
  }

  async getStrategiesVaults(strategyId: string) {
    return this.db.vaultStartegy.findMany({
      where: {
        strategy_id: strategyId,
      },
      include: {
        vault: true,
      },
    });
  }

  private mapStrategyDashboardInfoResponse(
    strategy: Strategy,
    startegyVaults: (VaultStartegy & { vault: Vault })[],
  ): StrategyInfoResponse {
    const vaults: StrategyVaultInfo[] = startegyVaults.map((v) => ({
      id: v.vault_id,
      amount: Number(v.deposited_amount),
      apy: Number(v.vault.current_apy),
      name: v.vault.name,
      tvl: Number(v.vault.current_tvl),
      depositedAmount:
        Number(v.deposited_amount_usd) + Number(v.interest_earned_usd),
      platform: v.vault.platform,
    }));
    const totalDep = startegyVaults.reduce(
      (acc, v) => acc + Number(v.deposited_amount_usd),
      0,
    );
    const { apy, userPosition, tvl } = startegyVaults.reduce(
      (acc, v) => ({
        apy:
          acc.apy +
          Number(v.vault.current_apy) * (Number(v.deposited_amount) / totalDep),
        userPosition:
          acc.userPosition +
          Number(v.deposited_amount_usd) +
          Number(v.interest_earned_usd),
        tvl: acc.tvl + Number(v.vault.current_tvl),
      }),
      { apy: 0, userPosition: 0, tvl: 0 },
    );

    return {
      strategyName: strategy.name,
      strategyId: strategy.id,
      vaults,
      strategyApy: apy / vaults.length,
      strategyDepositedAmount: userPosition,
      strategyTvl: tvl,
    };
  }
}
