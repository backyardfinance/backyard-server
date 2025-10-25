import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type CreateDepositTransactionDto = {
  protocolIndex: number;
  vaultId: PublicKey;
  amount: BN;
  signer: PublicKey;
  inputToken: PublicKey;
  lpMint: PublicKey;
};
