import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';
import { FluidToken, VaultFluidToken } from './types';
import { toNum } from '../../utils';
import { VaultPlatform } from '../../dto';
import { ApiService } from '../../common/abstract/api-service.abstract';
import { Prisma } from '@prisma/client';

const BPS = 10_000;

@Injectable()
export class JupiterApiService extends ApiService {
  private readonly logger = new Logger(JupiterApiService.name);

  constructor(db: DatabaseService) {
    super(db);
  }

  protected vaultPlatform: VaultPlatform = VaultPlatform.Jupiter;

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
}
