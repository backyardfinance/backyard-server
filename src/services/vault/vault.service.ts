import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { Vault, VaultHistory } from '@prisma/client';
import {
  UserStrategyInfoResponse,
  VaultHistoryInfoResponse,
  VaultInfoResponse,
  VaultInfoStrategyResponse,
} from '../../dto';

@Injectable()
export class VaultService {
  constructor(private readonly db: DatabaseService) {}

  async getVaults(): Promise<VaultInfoResponse[]> {
    const vaults = await this.db.vault.findMany();
    return vaults.map((v) => this.mapVaultToVaultInfoResponse(v));
  }

  async getVaultHistory(vaultId: string): Promise<VaultHistoryInfoResponse[]> {
    const vaultHistoryRecords = await this.db.vaultHistory.findMany({
      where: {
        vaultId: vaultId,
      },
    });
    return vaultHistoryRecords.map((vh) =>
      this.mapVaultHistoryToVaultHistoryInfoResponse(vh),
    );
  }

  async getVaultUserInfo(
    vaultId: string,
    userId: string,
  ): Promise<VaultInfoStrategyResponse> {
    const vault = await this.db.vault.findUnique({
      where: { id: vaultId },
    });
    if (!vault) {
      throw new Error('Vault not found');
    }
    const userStrategies = await this.db.strategy.findMany({
      where: { user_id: userId },
      select: { id: true, name: true },
    });
    const includeIds = userStrategies.map((s) => s.id);
    const vaultStrategies = await this.db.vaultStartegy.findMany({
      where: {
        vault_id: vaultId,
        strategy_id: {
          in: includeIds.length > 0 ? includeIds : undefined, // якщо пустий масив — не ставимо умову
        },
      },
    });
    const totals = await this.getTotalStrategyDepositedAmount(includeIds);
    const strategiesInfo: UserStrategyInfoResponse[] = vaultStrategies.map(
      (vs) => {
        const total =
          totals.find((t) => t.strategyId === vs.strategy_id)?.totalDeposited ??
          1;
        const strategyName =
          userStrategies.find((s) => s.id === vs.strategy_id)?.name ?? '';
        return {
          strategyId: vs.strategy_id,
          depositedAmount: Number(vs.deposited_amount),
          vaultWeight: Number(vs.deposited_amount) / total,
          strategyName: strategyName,
          interestEarned: Number(vs.interest_earned_usd),
        };
      },
    );
    return {
      apy: Number(vault.current_apy),
      assetPrice: Number(vault.current_asset_price),
      id: vault.id,
      name: vault.name,
      platform: vault.platform,
      strategies: strategiesInfo,
      tvl: Number(vault.platform),
      yardReward: Number(vault.current_yard_reward),
    };
  }

  private mapVaultToVaultInfoResponse(vault: Vault): VaultInfoResponse {
    return {
      id: vault.id,
      platform: vault.platform.toString(),
      name: vault.name,
      apy: Number(vault.current_apy),
      tvl: Number(vault.current_tvl),
      assetPrice: Number(vault.current_asset_price),
      yardReward: Number(vault.current_yard_reward),
    };
  }

  private mapVaultHistoryToVaultHistoryInfoResponse(
    vaultHisory: VaultHistory,
  ): VaultHistoryInfoResponse {
    return {
      recordedAt: vaultHisory.recorded_at,
      apy: Number(vaultHisory.apy),
      tvl: Number(vaultHisory.tvl),
      assetPrice: Number(vaultHisory.asset_price),
      yardReward: Number(vaultHisory.yard_reward),
    };
  }

  private async getTotalStrategyDepositedAmount(strategyIds: string[]) {
    if (strategyIds.length === 0) return [];

    const result = await this.db.vaultStartegy.groupBy({
      by: ['strategy_id'],
      where: {
        strategy_id: { in: strategyIds },
      },
      _sum: {
        deposited_amount: true,
      },
    });

    return result.map((r) => ({
      strategyId: r.strategy_id,
      totalDeposited: Number(r._sum.deposited_amount ?? 0),
    }));
  }
}
