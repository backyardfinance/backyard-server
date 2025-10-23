import { Injectable } from '@nestjs/common';
import { Connection, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { ConfigService } from '../../config/config.module';
import { DatabaseService } from '../../database';
import { Vault, VaultHistory } from '@prisma/client';
import { VaultHistoryInfoResponse, VaultInfoResponse } from '../../dto';

@Injectable()
export class VaultService {
  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
  ) {}

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

  private mapVaultToVaultInfoResponse(vault: Vault): VaultInfoResponse {
    return {
      id: vault.id,
      platform: vault.platform.toString(),
      name: vault.name,
      apy: Number(vault.current_apy),
      tvl: Number(vault.current_tvl),
      asset_price: Number(vault.current_asset_price),
      yard_reward: Number(vault.current_yard_reward),
    };
  }

  private mapVaultHistoryToVaultHistoryInfoResponse(
    vaultHisory: VaultHistory,
  ): VaultHistoryInfoResponse {
    return {
      recorded_at: vaultHisory.recorded_at,
      apy: Number(vaultHisory.apy),
      tvl: Number(vaultHisory.tvl),
      asset_price: Number(vaultHisory.asset_price),
      yard_reward: Number(vaultHisory.yard_reward),
    };
  }
}
