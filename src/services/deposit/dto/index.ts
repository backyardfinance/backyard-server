import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type CreateDepositDto = {
  protocolIndex: number;
  vaultId: PublicKey;
  amount: BN;
  signer: PublicKey;
  inputToken: PublicKey;
  lpMint: PublicKey;
};
