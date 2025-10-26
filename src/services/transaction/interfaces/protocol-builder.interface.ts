import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { QuoteVaultDataDto } from '../dto/quote-vault-data.dto';

export interface ProtocolBuilder {
  buildInstruction(
    data: QuoteVaultDataDto,
    signer: PublicKey,
  ): Promise<TransactionInstruction>;
}
