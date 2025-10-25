import { Prisma, Vault } from '@prisma/client';
import { VaultPlatform } from '../../dto';
import { DatabaseService } from '../../database';
import { Decimal } from '@prisma/client/runtime/library';

export abstract class ApiService {
  constructor(protected readonly db: DatabaseService) {}

  protected abstract vaultPlatform: VaultPlatform;

  protected async getVaults(): Promise<Vault[]> {
    return this.db.vault.findMany({
      where: {
        platform: this.vaultPlatform,
      },
    });
  }

  public abstract upsertVaultsFromApi(): Promise<void>;

  protected async upsertVaultsIntoDB(data: any[]): Promise<void> {
    const vaults: Prisma.VaultUpdateInput[] = this.transformApiResponse(data);

    await this.db.$transaction(async (tx) => {
      for (const update of vaults) {
        const { id, ...vaultData } = update as any; // ensure each update has vault ID

        if (!id) {
          continue;
        }

        await tx.vault.update({
          where: { id },
          data: vaultData,
        });

        const recordedAt = new Date();
        await tx.vaultHistory.upsert({
          where: {
            vaultId_recorded_at: {
              vaultId: id,
              recorded_at: recordedAt,
            },
          },
          update: {
            tvl: vaultData.current_tvl,
            apy: vaultData.current_apy,
            asset_price: vaultData.current_asset_price,
            yard_reward: vaultData.current_yard_reward,
          },
          create: {
            vaultId: id,
            recorded_at: recordedAt,
            tvl: vaultData.current_tvl,
            apy: vaultData.current_apy,
            asset_price: vaultData.current_asset_price,
            yard_reward: vaultData.current_yard_reward,
          },
        });

        const vaultStrategies = await tx.vaultStartegy.findMany({
          where: { vault_id: id },
        });

        for (const s of vaultStrategies) {
          const depositedUsd = Number(s.deposited_amount_usd);
          const fraction = Number(s.ownership_fraction);
          const currentTvl = Number(vaultData.current_tvl);
          const currentAssetPrice = Number(vaultData.current_asset_price);

          const currentValueUsd = fraction * currentTvl;

          const pnlUsd = currentValueUsd - depositedUsd;

          const interestToken =
            currentAssetPrice > 0 ? pnlUsd / currentAssetPrice : 0;

          await tx.vaultStartegy.update({
            where: { id: s.id },
            data: {
              interest_earned: new Decimal(interestToken.toFixed(18)),
              interest_earned_usd: new Decimal(pnlUsd.toFixed(18)),
            },
          });
        }
      }
    });
  }

  protected abstract transformApiResponse(
    data: any[],
  ): Prisma.VaultUpdateInput[];
}
