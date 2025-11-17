import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Kvault } from './types';
import { Prisma, Vault, VaultPlatform } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

// TODO:
@Injectable()
export class KaminoApiService {
  private readonly vaultPlatform = VaultPlatform.Kamino;

  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(KaminoApiService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async upsertVaultsFromApi(): Promise<void> {
    const vaults = await this.getVaults();
    const vaultsData: Kvault[] = [];
    for (const vault of vaults) {
      const { data } = await axios.get<Kvault>(
        `https://api.kamino.finance/kvaults/${vault.public_key}/metrics`,
        {
          method: 'GET',
        },
      );
      data.vault_id = vault.id;
      vaultsData.push(data);
    }
    await this.upsertVaultsIntoDB(vaultsData);
  }

  protected transformApiResponse(data: Kvault[]): Prisma.VaultUpdateInput[] {
    return data.map((vault) => {
      const baseApy = new Decimal(vault.apyActual || vault.apy || 0);
      const incentives = new Decimal(vault.apyIncentives || 0);
      const farmRewards = new Decimal(vault.apyFarmRewards || 0);

      const calculatedApy = baseApy.plus(incentives).plus(farmRewards);

      return {
        id: vault.vault_id,
        current_apy: new Decimal(calculatedApy).mul(100).toDecimalPlaces(2),
        current_tvl: new Decimal(vault.tokensInvestedUsd),
        current_asset_price: new Decimal(vault.tokenPrice),
        current_yard_reward: incentives, // or whatever represents yard reward
        updatedAt: new Date(),
      };
    });
  }

  async getVaults(): Promise<Vault[]> {
    return this.prisma.vault.findMany({
      where: {
        platform: this.vaultPlatform,
      },
    });
  }

  private async upsertVaultsIntoDB(data: any[]): Promise<void> {
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

  private calculateYardReward(tvl: Decimal): Decimal {
    const minPercent = 8;
    const maxPercent = 25;

    const randomPercent =
      Math.random() * (maxPercent - minPercent) + minPercent;

    return tvl.mul(new Decimal(randomPercent).div(100));
  }
}
