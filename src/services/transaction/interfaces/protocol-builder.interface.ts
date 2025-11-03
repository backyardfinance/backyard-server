import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { QuoteVaultDataDto } from '../dto/quote-vault-data.dto';
import { QuoteType } from 'src/services/quote/dto/quote-type.enum';

export interface ProtocolBuilder {
  buildInstruction(
    data: QuoteVaultDataDto,
    signer: PublicKey,
    type: QuoteType,
  ): Promise<TransactionInstruction>;
}
