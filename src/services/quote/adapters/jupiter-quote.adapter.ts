import { Connection, PublicKey } from '@solana/web3.js';
import { QuoteVaultDto } from '../dto/quote-response.dto';
import { QuoteAdapter, VaultData } from '../quote-adapter.interface';
import { Injectable } from '@nestjs/common';
import { VaultPlatform } from '@prisma/client';

@Injectable()
export class JupiterQuoteAdapter implements QuoteAdapter {
  private readonly connection: Connection;

  constructor() {}

  async fetchQuote(
    vaultData: VaultData,
    walletAddress: PublicKey,
  ): Promise<QuoteVaultDto> {
    const vaultId = vaultData?.id ?? 'vault-uuid-1';

    const dto: QuoteVaultDto = {
      vaultId,
      platform: VaultPlatform.Jupiter,
      amount: '1000000',
      accounts: {
        inputToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        lpToken: 'LPmint111111111111111111111111111111111111',
        fTokenMint: 'FToken111111111111111111111111111111111111',
        jupiterVault: 'Vault1111111111111111111111111111111111111',
        lending: 'Lending11111111111111111111111111111111111',
        lendingAdmin: 'Admin1111111111111111111111111111111111111',
        rewardsRateModel: 'Rewards1111111111111111111111111111111111',
        lendingSupplyPositionOnLiquidity:
          'Position111111111111111111111111111111111',
        liquidity: 'Liquidity111111111111111111111111111111111',
        liquidityProgram: 'Program11111111111111111111111111111111111',
        rateModel: 'RateModel1111111111111111111111111111111',
        supplyTokenReservesLiquidity:
          'Reserves11111111111111111111111111111111111',
      },
    };

    return dto;
  }
}
