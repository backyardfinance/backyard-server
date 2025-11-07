import { PublicKey } from '@solana/web3.js';
import { QuoteVaultDto } from '../dto/quote-response.dto';
import { QuoteAdapter } from '../quote-adapter.interface';
import { Injectable } from '@nestjs/common';
import { Vault, VaultPlatform } from '@prisma/client';

@Injectable()
export class JupiterQuoteAdapter implements QuoteAdapter {
  constructor() {}

  async fetchQuote(
    vault: Vault,
    walletAddress: PublicKey,
    amount: string,
  ): Promise<QuoteVaultDto> {
    const vaultId = vault.id;
    const vaultPubkey = vault.public_key;
    const apy = vault.current_apy;

    const result: QuoteVaultDto = {
      vaultId,
      vaultPubkey,
      apy: String(apy),
      platform: VaultPlatform.Jupiter,
      amount,
    };

    return result;
  }
}
