import { PublicKey } from '@solana/web3.js';

export type CreateMetadataParams = {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
};
