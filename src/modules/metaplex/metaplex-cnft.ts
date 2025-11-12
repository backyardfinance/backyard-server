import {
  createTreeV2,
  mintV2,
  mplBubblegum,
} from '@metaplex-foundation/mpl-bubblegum';
import { createCollection } from '@metaplex-foundation/mpl-core';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import {
  generateSigner,
  keypairIdentity,
  PublicKey,
  some,
  Umi,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { Injectable } from '@nestjs/common';
import { Connection } from '@solana/web3.js';

@Injectable()
export class MetaplexCNft {
  private readonly connection: Connection;
  private readonly umi: Umi;
  private merkleTreeAddress: PublicKey | null = null;
  private collectionAddress: PublicKey | null = null;

  constructor() {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');

    this.umi = createUmi(this.connection)
      .use(mplBubblegum())
      .use(mplTokenMetadata())
      .use(irysUploader({ address: 'https://devnet.irys.xyz' }));

    const keypair = this.umi.eddsa.createKeypairFromSecretKey(
      Uint8Array.from(JSON.parse(process.env.MASTER_WALLET_PRIVATE_KEY!)),
    );
    this.umi.use(keypairIdentity(keypair));
  }

  async createSoulboundCollection() {
    const collectionSigner = generateSigner(this.umi);

    await createCollection(this.umi, {
      collection: collectionSigner,
      name: 'Whitelist Access Pass',
      uri: 'https://example.com/whitelist-collection.json',
      plugins: [
        { type: 'BubblegumV2' },
        {
          type: 'PermanentFreezeDelegate',
          frozen: true,
          authority: {
            type: 'UpdateAuthority',
          },
        },
      ],
    }).sendAndConfirm(this.umi);

    this.collectionAddress = collectionSigner.publicKey;
    console.log('Collection created:', this.collectionAddress);
  }

  async createTree() {
    const merkleTree = generateSigner(this.umi);
    const builder = await createTreeV2(this.umi, {
      merkleTree,
      maxBufferSize: 64,
      maxDepth: 14,
    });

    //TODO: save tree
    await builder.sendAndConfirm(this.umi);
    console.log('merkle tree: ', merkleTree.publicKey);

    this.merkleTreeAddress = merkleTree.publicKey;

    return merkleTree;
  }

  async createCNtf(user: PublicKey) {
    const mintBulder = await mintV2(this.umi, {
      leafOwner: user,
      leafDelegate: this.umi.identity.publicKey,
      merkleTree: this.merkleTreeAddress,
      coreCollection: this.collectionAddress,
      metadata: {
        name: 'YEEE',
        uri: 'https://example.com/my-nft.json',
        sellerFeeBasisPoints: 0,
        collection: some(this.collectionAddress),
        creators: [],
      },
    }).sendAndConfirm(this.umi);

    console.log(mintBulder);
  }
}
