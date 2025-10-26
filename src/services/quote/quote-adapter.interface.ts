import { PublicKey } from '@solana/web3.js';
import { QuoteVaultDto } from './dto/quote-response.dto';
import { Vault } from '@prisma/client';

export interface VaultData {
  id: string;
  public_key: string;
  ourLpMint: string;
  input_token_mint: string;
  platform: string;
}

export interface QuoteAdapter {
  fetchQuote(
    vaultData: Vault,
    walletAddress: PublicKey,
    amount: string,
  ): Promise<QuoteVaultDto>;
}
