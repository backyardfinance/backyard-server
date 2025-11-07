import { Injectable, Logger } from '@nestjs/common';
import { ApiService } from '../../common/abstract/api-service.abstract';
import { VaultPlatform } from '../../dto';
import axios from 'axios';
import { Kvault } from './types';
import { Prisma, Vault } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KaminoApiService extends ApiService {
  private readonly logger = new Logger(KaminoApiService.name);
  protected override vaultPlatform = VaultPlatform.Kamino;

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

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
}
