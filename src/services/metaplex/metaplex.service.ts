import {
  createV1,
  mplTokenMetadata,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  keypairIdentity,
  percentAmount,
  PublicKey,
  publicKey,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';
import { CreateMetadataParams } from './types';

@Injectable()
export class MetaplexService {
  private readonly connection: Connection;
  // TODO: ref this one
  private readonly master = new Uint8Array(
    JSON.parse(process.env.MASTER_WALLET_PRIVATE_KEY),
  );
  private readonly SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  );

  constructor(private readonly config: ConfigService) {
    const rpc =
      this.config.get<string>('rpc_url') || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpc, 'confirmed');
  }

  async uploadToken2022Meta(params: CreateMetadataParams) {
    const { mint, lpName, lpSymbol, uri } = params;

    const umi = createUmi(this.connection.rpcEndpoint);
    umi.use(mplTokenMetadata());
    const umiWallet = umi.eddsa.createKeypairFromSecretKey(this.master);
    umi.use(keypairIdentity(umiWallet));

    const result = await createV1(umi, {
      mint: publicKey(mint),
      name: lpName,
      symbol: lpSymbol,
      uri,
      sellerFeeBasisPoints: percentAmount(0),
      splTokenProgram: this.SPL_TOKEN_2022_PROGRAM_ID,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);

    return result.signature;
  }
}
