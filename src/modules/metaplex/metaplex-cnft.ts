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
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';
import { PinataSDK } from 'pinata';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
  };
}

@Injectable()
export class MetaplexCNftService {
  private readonly connection: Connection;
  private readonly umi: Umi;
  private merkleTreeAddress: PublicKey;
  private collectionAddress: PublicKey;
  private readonly pinataJWT: string;
  private readonly pinataImageUrl: string;
  private collectionMetadataUri: string;
  private readonly pinata: PinataSDK;

  constructor(private readonly config: ConfigService) {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.umi = createUmi(this.connection)
      .use(mplBubblegum())
      .use(mplTokenMetadata());

    const keypair = this.umi.eddsa.createKeypairFromSecretKey(
      Uint8Array.from(JSON.parse(process.env.MASTER_WALLET_PRIVATE_KEY!)),
    );
    this.umi.use(keypairIdentity(keypair));

    const pinataJwt = process.env.PINATA_JWT!;
    this.pinataImageUrl = process.env.PINATA_IMAGE_URL!;
    const pinataGateway = process.env.PINATA_GATEWAY!;

    if (config.get<string>('IS_WHITELIST_ACTIVE') === 'true') {
      this.merkleTreeAddress = publicKey(config.get<string>('MERKLE_TREE'));
      this.collectionAddress = publicKey(config.get<string>('COLLECTION'));
      this.collectionMetadataUri = config.get<string>(
        'COLLECTION_METADATA_URI',
      );
    }

    this.pinata = new PinataSDK({
      pinataJwt,
      pinataGateway,
    });
  }

  async createCollectionMetadata(): Promise<string> {
    const collectionMetadata: NFTMetadata = {
      name: 'Backyard: Early Contributor',
      description:
        'Claim your Early Contributor NFT to get boosted APY in LP Mining Campaign SEASON 1:\n Early contributor NFT badge\n Boosted APY in the season 1 LP Mining Campaign\n Priority access to launch updates and community events',
      image: this.pinataImageUrl,
      external_url: 'https://www.backyard.finance/',
      properties: {
        files: [
          {
            uri: this.pinataImageUrl,
            type: 'image/png',
          },
        ],
        category: 'image',
      },
    };

    const metadataUri = await this.uploadMetadataToPinata(collectionMetadata);
    return metadataUri;
  }

  async createNFTMetadata(walletAddress: string): Promise<string> {
    const nftMetadata: NFTMetadata = {
      name: 'Early Contributor: Season 1',
      description: `Claim your Early Contributor NFT to get boosted APY in LP Mining Campaign SEASON 1:\n Early contributor NFT badge\n Boosted APY in the season 1 LP Mining Campaign\n Priority access to launch updates and community events\n\nHolder: ${walletAddress}`,
      image: this.pinataImageUrl,
      external_url: 'https://www.backyard.finance/',
      properties: {
        files: [
          {
            uri: this.pinataImageUrl,
            type: 'image/png',
          },
        ],
        category: 'image',
      },
    };
    const metadataUri = await this.uploadMetadataToPinata(nftMetadata);

    return metadataUri;
  }

  private async uploadMetadataToPinata(metadata: NFTMetadata): Promise<string> {
    const upload = await this.pinata.upload.public.json(metadata);
    const metadataUri = `https://${process.env.PINATA_GATEWAY}/ipfs/${upload.cid}`;
    return metadataUri;
  }

  async createSoulboundCollection() {
    this.collectionMetadataUri = await this.createCollectionMetadata();

    const collectionSigner = generateSigner(this.umi);
    await createCollection(this.umi, {
      collection: collectionSigner,
      name: 'Backyard: Early Contributor',
      uri: this.collectionMetadataUri,
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
    console.log('Collection metadata URI:', this.collectionMetadataUri);
  }

  async createTree() {
    const merkleTree = generateSigner(this.umi);
    const builder = await createTreeV2(this.umi, {
      merkleTree,
      maxBufferSize: 64,
      maxDepth: 14,
    });

    await builder.sendAndConfirm(this.umi);
    console.log('Merkle tree:', merkleTree.publicKey);
    this.merkleTreeAddress = merkleTree.publicKey;

    return merkleTree;
  }

  async prepareMintTransaction(user: PublicKey) {
    const metadataUri = await this.createNFTMetadata(user.toString());

    const mintBuilder = mintV2(this.umi, {
      leafOwner: user,
      leafDelegate: this.umi.identity.publicKey,
      merkleTree: this.merkleTreeAddress,
      coreCollection: this.collectionAddress,
      metadata: {
        name: `Early Contributor: Season 1`,
        uri: metadataUri,
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
      metadataUri,
    };
  }
}
