import { PublicKey } from '@solana/web3.js';
import { QuoteVaultDto } from './dto/quote-response.dto';
import { Vault } from '@prisma/client';

export interface QuoteAdapter {
  fetchQuote(
    vaultData: Vault,
    walletAddress: PublicKey,
    amount: string,
  ): Promise<QuoteVaultDto>;
}
