import { Prisma, Vault } from '@prisma/client';
import { VaultPlatform } from '../../dto';
import { DatabaseService } from '../../database';

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
    const vaults: Prisma.VaultUpdateInput[] =
      await this.transformApiResponse(data);

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
      }
    });
  }

  protected abstract transformApiResponse(
    data: any[],
  ): Prisma.VaultUpdateInput[];
}
