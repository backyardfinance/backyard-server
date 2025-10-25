import { PublicKey } from '@solana/web3.js';
import { QuoteVaultDto } from './dto/quote-response.dto';

export interface VaultData {
  id: string;
  public_key: string;
  platform: string;
}

export interface QuoteAdapter {
  fetchQuote(
    vaultData: VaultData,
    walletAddress: PublicKey,
  ): Promise<QuoteVaultDto>;
}
