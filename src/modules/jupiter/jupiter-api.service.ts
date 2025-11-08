import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';
import { FluidToken, VaultFluidToken } from './types';
import { Prisma, Vault, VaultPlatform } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from 'src/common/utils';

const BPS = 10_000;

@Injectable()
export class JupiterApiService {
  constructor(private readonly prisma: PrismaService) {}

  private vaultPlatform: VaultPlatform = VaultPlatform.Jupiter;

  protected transformApiResponse(
    data: VaultFluidToken[],
  ): Prisma.VaultUpdateInput[] {
    return data.map((vft) => {
      const decimals = toNum(vft.asset?.decimals ?? vft.decimals, 9);
      const price = toNum(vft.asset?.price ?? vft.price, 0);

      const totalAssetsRaw = toNum(vft.totalAssets ?? vft.totalSupply, 0);
      const totalAssets = totalAssetsRaw / 10 ** decimals;

      const tvlUsd = totalAssets * price;

      const totalRateBps =
        toNum(vft.totalRate, NaN) ||
        toNum(vft.supplyRate) + toNum(vft.rewardsRate);
      const apyFraction = totalRateBps / BPS;

      const apyDec = new Decimal(apyFraction).mul(100).toDecimalPlaces(2);
      const tvlDec = new Decimal(tvlUsd.toFixed(18));
      const assetPriceDec = new Decimal(price.toFixed(18));
      // TODO: calculate here
      const yardRewardDec = new Decimal(0);
      return {
        id: vft.vaultId,
        current_apy: apyDec,
        current_tvl: tvlDec,
        current_asset_price: assetPriceDec,
        current_yard_reward: yardRewardDec, // or whatever represents yard reward
        updatedAt: new Date(),
      };
    });
  }

  async upsertVaultsFromApi(): Promise<void> {
    const vaults = await this.getVaults();
    const vaultIdsByAddress = new Map<string, string>(
      vaults.map((vault) => [vault.public_key, vault.id]),
    );
    if (vaults.length === 0) return;

    const { data } = await axios.get<FluidToken[]>(
      'https://api.solana.fluid.io/v1/lending/tokens',
      {
        method: 'GET',
      },
    );
    const fluidTokens: FluidToken[] = Array.isArray(data) ? data : [];
    const vaultIdToTokenMap: VaultFluidToken[] = fluidTokens
      .filter((ft) => vaultIdsByAddress.has(ft.assetAddress))
      .map((ft) => {
        return {
          ...ft,
          vaultId: vaultIdsByAddress.get(ft.assetAddress),
        };
      });
    await this.upsertVaultsIntoDB(vaultIdToTokenMap);
  }

  async getVaults(): Promise<Vault[]> {
    return this.prisma.vault.findMany({
      where: {
        platform: this.vaultPlatform,
      },
    });
  }

  async upsertVaultsIntoDB(data: any[]): Promise<void> {
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
