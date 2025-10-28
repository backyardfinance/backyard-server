import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { Strategy, Vault, VaultHistory, VaultStartegy } from '@prisma/client';
import {
  PortfolioHistoryPoint,
  StrategyHistoryPoint,
  StrategyInfoResponse,
  StrategyVaultInfo,
} from '../../dto';

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
    const strategy = await this.db.strategy.findUnique({
      where: { id: strategyId },
    });
    if (!strategy) {
      throw new Error('Strategy not found');
    }
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

  public async getStrategyHistory(
    strategyId: string,
  ): Promise<StrategyHistoryPoint[]> {
    const strategyVaults = await this.db.vaultStartegy.findMany({
      where: { strategy_id: strategyId },
      select: {
        vault_id: true,
        ownership_fraction: true,
        createdAt: true,
      },
    });

    if (strategyVaults.length === 0) {
      return [];
    }

    const strategyStartTs = strategyVaults
      .map((sv) => sv.createdAt.getTime())
      .sort((a, b) => a - b)[0];

    const vaultIds = [...new Set(strategyVaults.map((sv) => sv.vault_id))];

    const vaultHistoriesByVault: Record<string, VaultHistory[]> = {};

    for (const vaultId of vaultIds) {
      vaultHistoriesByVault[vaultId] = await this.db.vaultHistory.findMany({
        where: {
          vaultId,
          recorded_at: {
            gte: new Date(strategyStartTs),
          },
        },
        orderBy: {
          recorded_at: 'asc',
        },
      });
    }

    const makeBucketKey = (date: Date): { key: string; bucketTime: Date } => {
      const bucketTime = new Date(date);
      bucketTime.setSeconds(0, 0);
      return { key: bucketTime.toISOString(), bucketTime };
    };

    type Bucket = {
      recordedAt: Date;
      totalPositionUsd: number;
      apyNum: number;
      apyDen: number;
    };

    const bucketMap = new Map<string, Bucket>();
    for (const sv of strategyVaults) {
      const frac = Number(sv.ownership_fraction);
      const historyForThisVault = vaultHistoriesByVault[sv.vault_id] ?? [];
      const vaultJoinTs = sv.createdAt.getTime();

      for (const vh of historyForThisVault) {
        const ts = vh.recorded_at.getTime();
        if (ts < vaultJoinTs) {
          continue;
        }

        const exposureUsdAtT = Number(vh.tvl) * frac;

        const apyAtT = Number(vh.apy);

        const { key, bucketTime } = makeBucketKey(vh.recorded_at);

        let bucket = bucketMap.get(key);
        if (!bucket) {
          bucket = {
            recordedAt: bucketTime,
            totalPositionUsd: 0,
            apyNum: 0,
            apyDen: 0,
          };
          bucketMap.set(key, bucket);
        }

        bucket.totalPositionUsd += exposureUsdAtT;
        bucket.apyNum += apyAtT * exposureUsdAtT;
        bucket.apyDen += exposureUsdAtT;
      }
    }

    const points: StrategyHistoryPoint[] = Array.from(bucketMap.values())
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
      .map((b) => {
        const blendedApyAtT = b.apyDen > 0 ? b.apyNum / b.apyDen : 0;

        return {
          recordedAt: b.recordedAt,
          positionUsd: b.totalPositionUsd,
          apy: blendedApyAtT,
        };
      });

    return points;
  }

  public async getUserPortfolioHistory(
    userId: string,
  ): Promise<PortfolioHistoryPoint[]> {
    const strategies = await this.db.strategy.findMany({
      where: { user_id: userId },
      select: { id: true, createdAt: true },
    });

    if (strategies.length === 0) return [];

    const allHistories: Record<string, StrategyHistoryPoint[]> = {};
    for (const s of strategies) {
      allHistories[s.id] = await this.getStrategyHistory(s.id);
    }

    type Bucket = {
      recordedAt: Date;
      totalPositionUsd: number;
      apyNum: number;
      apyDen: number;
    };
    const bucketMap = new Map<string, Bucket>();

    function makeBucketKey(date: Date): { key: string; bucketTime: Date } {
      const bucketTime = new Date(date);
      bucketTime.setMinutes(0, 0, 0);
      return { key: bucketTime.toISOString(), bucketTime };
    }

    for (const strategyId of Object.keys(allHistories)) {
      for (const point of allHistories[strategyId]) {
        const { key, bucketTime } = makeBucketKey(point.recordedAt);

        let bucket = bucketMap.get(key);
        if (!bucket) {
          bucket = {
            recordedAt: bucketTime,
            totalPositionUsd: 0,
            apyNum: 0,
            apyDen: 0,
          };
          bucketMap.set(key, bucket);
        }

        const exposureUsd = point.positionUsd;
        bucket.totalPositionUsd += exposureUsd;
        bucket.apyNum += point.apy * exposureUsd;
        bucket.apyDen += exposureUsd;
      }
    }

    return Array.from(bucketMap.values())
      .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
      .map((b) => ({
        recordedAt: b.recordedAt,
        totalPositionUsd: b.totalPositionUsd,
        avgApy: b.apyDen > 0 ? b.apyNum / b.apyDen : 0,
      }));
  }

  private mapStrategyDashboardInfoResponse(
    strategy: Strategy,
    strategyVaults: (VaultStartegy & { vault: Vault })[],
  ): StrategyInfoResponse {
    const vaults: StrategyVaultInfo[] = strategyVaults.map((v) => ({
      id: v.vault_id,
      amount: Number(v.deposited_amount),
      apy: Number(v.vault.current_apy),
      name: v.vault.name,
      tvl: Number(v.vault.current_tvl),
      depositedAmount:
        Number(v.deposited_amount_usd) + Number(v.interest_earned_usd),
      platform: v.vault.platform,
    }));

    const parts = strategyVaults.map((sv) => {
      const frac = Number(sv.ownership_fraction);

      const vaultTvlUsd = Number(sv.vault.current_tvl);
      const vaultApy = Number(sv.vault.current_apy);

      const positionUsdPart = vaultTvlUsd * frac;

      return {
        positionUsdPart,
        vaultApy,
      };
    });

    const totalPositionUsd = parts.reduce(
      (acc, p) => acc + p.positionUsdPart,
      0,
    );

    const weightedApy =
      totalPositionUsd > 0
        ? parts.reduce((acc, p) => acc + p.vaultApy * p.positionUsdPart, 0) /
          totalPositionUsd
        : 0;

    return {
      strategyName: strategy.name ?? '',
      strategyId: strategy.id,

      strategyDepositedAmount: totalPositionUsd,

      strategyApy: weightedApy,

      vaults,
    };
  }
}
