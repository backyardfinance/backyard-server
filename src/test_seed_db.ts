import { INestApplication } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { DatabaseService } from './database';
import { VaultPlatform } from './dto';

export const testSeedDb = async (app: INestApplication) => {
  const prisma = app.get(DatabaseService);

  const vaults = [
    {
      public_key: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      platform: VaultPlatform.Jupiter,
      current_tvl: new Decimal('399139783480000'), // totalSupply
      current_apy: new Decimal('0.0702'),
    },
    {
      public_key: 'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA',
      name: 'USDS',
      platform: VaultPlatform.Jupiter,
      current_tvl: new Decimal('21188712677731'),
      current_apy: new Decimal('0.0810'),
    },
  ];

  for (const data of vaults) {
    const existing = await prisma.vault.findFirst({
      where: { public_key: data.public_key },
      select: { id: true },
    });

    if (existing) {
      await prisma.vault.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.vault.create({ data });
    }
  }

  console.log('✅ Vault table seeded with USDC & USDS (Jupiter Lend)');
};
