import { Prisma, Vault } from '@prisma/client';
import { VaultPlatform } from '../../dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export abstract class ApiService {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract vaultPlatform: VaultPlatform;

  protected async getVaults(): Promise<Vault[]> {
    return this.prisma.vault.findMany({
      where: {
        platform: this.vaultPlatform,
      },
    });
  }

  public abstract upsertVaultsFromApi(): Promise<void>;

  protected async upsertVaultsIntoDB(data: any[]): Promise<void> {
    const vaults: Prisma.VaultUpdateInput[] = this.transformApiResponse(data);

    await this.prisma.$transaction(async (tx) => {
      for (const update of vaults) {
        const { id, ...vaultData } = update as any; // ensure each update has vault ID

        if (!id) {
          continue;
        }

        await tx.vault.update({
          where: { id },
          data: vaultData,
        });

        const yard = this.calculateYardReward(vaultData.current_tvl);
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
            yard_reward: yard,
          },
          create: {
            vaultId: id,
            recorded_at: recordedAt,
            tvl: vaultData.current_tvl,
            apy: vaultData.current_apy,
            asset_price: vaultData.current_asset_price,
            yard_reward: yard,
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

  private calculateYardReward(tvl: Decimal): Decimal {
    const minPercent = 8;
    const maxPercent = 25;

    const randomPercent =
      Math.random() * (maxPercent - minPercent) + minPercent;

    return tvl.mul(new Decimal(randomPercent).div(100));
  }
}
