import {
  createTreeV2,
  mintV2,
  mplBubblegum,
} from '@metaplex-foundation/mpl-bubblegum';
import { createCollection } from '@metaplex-foundation/mpl-core';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import {
  createNoopSigner,
  generateSigner,
  keypairIdentity,
  publicKey,
  PublicKey,
  some,
  Umi,
} from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';

@Injectable()
export class MetaplexCNftService {
  private readonly connection: Connection;
  private readonly umi: Umi;
  private merkleTreeAddress: PublicKey;
  private collectionAddress: PublicKey;

  constructor(private readonly config: ConfigService) {
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

    if (config.get<string>('IS_WHITELIST_ACTIVE') === 'true') {
      this.merkleTreeAddress = publicKey(config.get<string>('MERKLE_TREE'));
      this.collectionAddress = publicKey(config.get<string>('COLLECTION'));
    }
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
          authority: { type: 'None' },
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

  async prepareMintTransaction(user: PublicKey) {
    const mintBuilder = mintV2(this.umi, {
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
    });

    const tx = await mintBuilder
      .setFeePayer(createNoopSigner(user))
      .buildWithLatestBlockhash(this.umi);

    const serializedTx = this.umi.transactions.serialize(tx);
    const base64Tx = Buffer.from(serializedTx).toString('base64');

    return {
      transaction: base64Tx,
    };
  }
}
