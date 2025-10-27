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

  async getVaultHistory(
    vaultId: string,
    userId: string,
  ): Promise<VaultHistoryInfoResponse[]> {
    const vaultHistoryRecords = await this.db.vaultHistory.findMany({
      where: {
        vaultId: vaultId,
      },
      orderBy: {
        recorded_at: 'asc',
      },
    });
    const vaultKey = await this.db.vault.findUnique({
      where: {
        id: vaultId,
      },
      select: {
        public_key: true,
      },
    });

    const userVaultStrategies = await this.db.vaultStartegy.findMany({
      where: {
        vault_id: vaultId,
        strategy: {
          user_id: userId,
        },
      },
      select: {
        createdAt: true,
        ownership_fraction: true,
      },
    });

    if (userVaultStrategies.length === 0) {
      return vaultHistoryRecords.map((vh) => ({
        ...this.mapVaultHistoryToVaultHistoryInfoResponse(
          vh,
          vaultKey?.public_key ?? '',
          0,
          0,
        ),
      }));
    }

    const firstUserJoinDate = userVaultStrategies
      .map((s) => s.createdAt.getTime())
      .sort((a, b) => a - b)[0];

    const { totalOwnershipFraction } =
      await this.getUserOwnershipFractionInVault(vaultId, userId);

    return vaultHistoryRecords
      .filter((vh) => vh.recorded_at.getTime() >= firstUserJoinDate)
      .map((vh) => {
        const myPositionUsdAtThatTime = Number(vh.tvl) * totalOwnershipFraction;

        const userApyAtThatTime = Number(vh.apy);

        const base = this.mapVaultHistoryToVaultHistoryInfoResponse(
          vh,
          vaultKey?.public_key ?? '',
          myPositionUsdAtThatTime,
          userApyAtThatTime,
        );

        return {
          ...base,
          myPositionUsd: myPositionUsdAtThatTime,
        };
      });
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

    const { totalOwnershipFraction, userStrategyIds } =
      await this.getUserOwnershipFractionInVault(vaultId, userId);

    const userStrategies = await this.db.strategy.findMany({
      where: { user_id: userId },
      select: { id: true, name: true },
    });

    const vaultStrategies = await this.db.vaultStartegy.findMany({
      where: {
        vault_id: vaultId,
        strategy_id: {
          in: userStrategyIds.length > 0 ? userStrategyIds : undefined,
        },
      },
    });
    const totals = await this.getTotalStrategyDepositedAmount(userStrategyIds);
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

    const myPositionUsd = Number(vault.current_tvl) * totalOwnershipFraction;

    return {
      apy: Number(vault.current_apy),
      assetPrice: Number(vault.current_asset_price),
      id: vault.id,
      name: vault.name,
      platform: vault.platform,
      strategies: strategiesInfo,
      tvl: Number(vault.platform),

      myPositionUsd,
      myOwnershipFraction: totalOwnershipFraction,

      yardReward: Number(vault.current_yard_reward),
      publicKey: vault.public_key,
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
      publicKey: vault.public_key,
    };
  }

  private mapVaultHistoryToVaultHistoryInfoResponse(
    vaultHisory: VaultHistory,
    publicKey: string,
    myPositionUsdAtThatTime: number,
    userApyAtThatTime: number,
  ): VaultHistoryInfoResponse {
    return {
      recordedAt: vaultHisory.recorded_at,
      apy: Number(vaultHisory.apy),
      tvl: Number(vaultHisory.tvl),
      assetPrice: Number(vaultHisory.asset_price),
      yardReward: Number(vaultHisory.yard_reward),
      publicKey: publicKey,
      user: {
        positionUsd: myPositionUsdAtThatTime,
        apy: userApyAtThatTime,
      },
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

  private async getUserOwnershipFractionInVault(
    vaultId: string,
    userId: string,
  ) {
    const userStrategies = await this.db.strategy.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    if (userStrategies.length === 0) {
      return {
        totalOwnershipFraction: 0,
        userStrategyIds: [] as string[],
      };
    }

    const userStrategyIds = userStrategies.map((s) => s.id);

    const vaultStrategies = await this.db.vaultStartegy.findMany({
      where: {
        vault_id: vaultId,
        strategy_id: { in: userStrategyIds },
      },
      select: {
        strategy_id: true,
        ownership_fraction: true,
      },
    });

    const totalOwnershipFraction = vaultStrategies.reduce(
      (acc, vs) => acc + Number(vs.ownership_fraction),
      0,
    );

    return {
      totalOwnershipFraction,
      userStrategyIds,
    };
  }
}
