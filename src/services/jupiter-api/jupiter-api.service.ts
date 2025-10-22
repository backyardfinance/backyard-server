import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';
import { FluidToken } from './types';
import { startOfHour, toNum } from '../../utils';

const BPS = 10_000;

@Injectable()
export class JupiterApiService {
  private readonly logger = new Logger(JupiterApiService.name);

  constructor(private readonly db: DatabaseService) {}

  public async snapshotVaultsAndUpdateCurrent(): Promise<void> {
    const vaults = await this.db.vault.findMany();
    if (vaults.length === 0) return;

    const { data } = await axios.get<FluidToken[]>(
      'https://api.solana.fluid.io/v1/lending/tokens',
      {
        method: 'GET',
      },
    );

    const tokens = Array.isArray(data) ? data : [];

    const recordedAt = startOfHour(new Date());

    for (const vault of vaults) {
      const obj =
        tokens.find(
          (o) => o.assetAddress === vault.public_key,
          // || o.address === vault.public_key,
        ) ?? null;

      if (!obj) {
        this.logger.warn(
          `No Fluid token found for vault ${vault.id} (${vault.public_key})`,
        );
        continue;
      }

      const decimals = toNum(obj.asset?.decimals ?? obj.decimals, 9);
      const price = toNum(obj.asset?.price ?? obj.price, 0);

      const totalAssetsRaw = toNum(obj.totalAssets ?? obj.totalSupply, 0);
      const totalAssets = totalAssetsRaw / 10 ** decimals;

      const tvlUsd = totalAssets * price;

      const totalRateBps =
        toNum(obj.totalRate, NaN) ||
        toNum(obj.supplyRate) + toNum(obj.rewardsRate);
      const apyFraction = totalRateBps / BPS;

      const assetPriceUsdTotal = totalAssets * price;

      const apyDec = new Decimal(apyFraction.toFixed(18));
      const tvlDec = new Decimal(tvlUsd.toFixed(18));
      const assetPriceDec = new Decimal(assetPriceUsdTotal.toFixed(18));
      // TODO: calculate here
      const yardRewardDec = new Decimal(0);

      await this.db.$transaction(async (tx) => {
        await tx.vault.update({
          where: { id: vault.id },
          data: {
            current_apy: apyDec,
            current_tvl: tvlDec,
            current_asset_price: assetPriceDec,
            current_yard_reward: yardRewardDec,
          },
        });

        await tx.vaultHistory.upsert({
          where: {
            vaultId_recorded_at: {
              vaultId: vault.id,
              recorded_at: recordedAt,
            },
          },
          update: {
            tvl: tvlDec,
            apy: apyDec,
            asset_price: assetPriceDec,
            yard_reward: yardRewardDec,
          },
          create: {
            vaultId: vault.id,
            recorded_at: recordedAt,
            tvl: tvlDec,
            apy: apyDec,
            asset_price: assetPriceDec,
            yard_reward: yardRewardDec,
          },
        });
      });
    }
  }
}
