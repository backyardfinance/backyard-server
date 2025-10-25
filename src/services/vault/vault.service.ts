import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { Vault, VaultHistory } from '@prisma/client';
import {
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
    strategyId: string,
  ): Promise<VaultInfoStrategyResponse> {}

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
}
