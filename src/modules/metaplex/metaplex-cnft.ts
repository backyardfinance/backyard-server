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
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from '@solana/web3.js';
import { PinataSDK } from 'pinata';
import { NFTMetadata } from './interfaces/nft-metadata.interface';
import { CollectionConfig } from './interfaces/collection-config.interface';
import { MintTransactionResult } from './interfaces/mint-transaction-result.interface';

@Injectable()
export class MetaplexCNftService {
  private readonly logger = new Logger(MetaplexCNftService.name);
  private readonly connection: Connection;
  private readonly umi: Umi;
  private readonly pinata: PinataSDK;
  private readonly pinataImageUrl: string;
  private readonly pinataGateway: string;

  private merkleTreeAddress?: PublicKey;
  private collectionAddress?: PublicKey;
  private collectionMetadataUri?: string;
  private nftMetadataUri?: string;

  private readonly COLLECTION_CONFIG: CollectionConfig = {
    name: 'Backyard: Early Contributor',
    description:
      'Claim your Early Contributor NFT to get boosted APY in LP Mining Campaign SEASON 1:\n Early contributor NFT badge\n Boosted APY in the season 1 LP Mining Campaign\n Priority access to launch updates and community events',
    externalUrl: 'https://www.backyard.finance/',
  };

  private readonly MERKLE_TREE_CONFIG = {
    maxBufferSize: 64,
    maxDepth: 14,
  };

  constructor(private readonly config: ConfigService) {
    const rpcUrl = this.config.get<string>(
      'RPC_URL',
      'https://api.devnet.solana.com',
    );

    this.connection = new Connection(rpcUrl, 'confirmed');

    this.umi = createUmi(this.connection)
      .use(mplBubblegum())
      .use(mplTokenMetadata());

    const privateKey = this.config.getOrThrow<string>(
      'MASTER_WALLET_PRIVATE_KEY',
    );
    const keypair = this.umi.eddsa.createKeypairFromSecretKey(
      Uint8Array.from(JSON.parse(privateKey)),
    );
    this.umi.use(keypairIdentity(keypair));

    const pinataJwt = this.config.getOrThrow<string>('PINATA_JWT');
    const pinataImageUrl = this.config.getOrThrow<string>('PINATA_IMAGE_URL');
    const pinataGateway = this.config.getOrThrow<string>('PINATA_GATEWAY');

    this.pinata = new PinataSDK({
      pinataJwt,
      pinataGateway,
    });

    this.pinataImageUrl = pinataImageUrl;
    this.pinataGateway = pinataGateway;

    const isWhitelistActive =
      this.config.get<string>('IS_WHITELIST_ACTIVE') === 'true';

    if (isWhitelistActive) {
      this.merkleTreeAddress = publicKey(
        this.config.getOrThrow<string>('MERKLE_TREE'),
      );
      this.collectionAddress = publicKey(
        this.config.getOrThrow<string>('COLLECTION'),
      );
      this.collectionMetadataUri = this.config.getOrThrow<string>(
        'COLLECTION_METADATA_URI',
      );
    }
    this.nftMetadataUri = this.config.get<string>('NFT_METADATA_URI');
  }

  private createMetadata(
    name: string,
    description: string,
    image: string,
    externalUrl: string,
  ): NFTMetadata {
    return {
      name,
      description,
      image,
      external_url: externalUrl,
      properties: {
        files: [{ uri: image, type: 'image/png' }],
        category: 'image',
      },
    };
  }

  async createCollectionMetadata(): Promise<string> {
    const metadata = this.createMetadata(
      this.COLLECTION_CONFIG.name,
      this.COLLECTION_CONFIG.description,
      this.pinataImageUrl,
      this.COLLECTION_CONFIG.externalUrl,
    );

    return this.uploadMetadataToPinata(metadata);
  }

  async createNFTMetadata(): Promise<string> {
    const metadata = this.createMetadata(
      'Early Contributor: Season 1',
      this.COLLECTION_CONFIG.description,
      this.pinataImageUrl,
      this.COLLECTION_CONFIG.externalUrl,
    );

    return this.uploadMetadataToPinata(metadata);
  }

  private async uploadMetadataToPinata(metadata: NFTMetadata): Promise<string> {
    try {
      const upload = await this.pinata.upload.public.json(metadata);
      return `https://${this.pinataGateway}/ipfs/${upload.cid}`;
    } catch (error) {
      this.logger.error('Failed to upload metadata to Pinata', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  async createSoulboundCollection(): Promise<void> {
    try {
      this.collectionMetadataUri = await this.createCollectionMetadata();
      const collectionSigner = generateSigner(this.umi);

      await createCollection(this.umi, {
        collection: collectionSigner,
        name: this.COLLECTION_CONFIG.name,
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

      this.logger.log(`Collection created: ${this.collectionAddress}`);
      this.logger.log(`Collection metadata URI: ${this.collectionMetadataUri}`);
    } catch (error) {
      this.logger.error('Failed to create soulbound collection', error);
      throw new Error('Failed to create collection');
    }
  }

  async createTree(): Promise<PublicKey> {
    try {
      const merkleTree = generateSigner(this.umi);

      const builder = await createTreeV2(this.umi, {
        merkleTree,
        maxBufferSize: this.MERKLE_TREE_CONFIG.maxBufferSize,
        maxDepth: this.MERKLE_TREE_CONFIG.maxDepth,
      });

      await builder.sendAndConfirm(this.umi);

      this.merkleTreeAddress = merkleTree.publicKey;
      this.logger.log(`Merkle tree created: ${this.merkleTreeAddress}`);

      return merkleTree.publicKey;
    } catch (error) {
      this.logger.error('Failed to create merkle tree', error);
      throw new Error('Failed to create merkle tree');
    }
  }

  async prepareMintTransaction(
    user: PublicKey,
  ): Promise<MintTransactionResult> {
    this.validateConfiguration();

    const hasNft = await this.checkUserHasNFT(user.toString());
    if (hasNft) {
      throw new BadRequestException('User has already claimed the NFT');
    }

    try {
      const mintBuilder = mintV2(this.umi, {
        leafOwner: user,
        leafDelegate: this.umi.identity.publicKey,
        merkleTree: this.merkleTreeAddress!,
        coreCollection: this.collectionAddress!,
        metadata: {
          name: 'Early Contributor: Season 1',
          uri: this.nftMetadataUri!,
          sellerFeeBasisPoints: 0,
          collection: some(this.collectionAddress!),
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
    } catch (error) {
      this.logger.error('Failed to prepare mint transaction', error);
      throw new Error('Failed to prepare mint transaction');
    }
  }

  async checkUserHasNFT(userWalletAddress: string): Promise<boolean> {
    this.validateConfiguration();

    try {
      const userPublicKey = publicKey(userWalletAddress);
      const assets = await this.umi.rpc.getAssetsByOwner({
        owner: userPublicKey,
      });

      return assets.items.some((asset) =>
        asset.grouping?.some(
          (group) =>
            group.group_key === 'collection' &&
            group.group_value === this.collectionAddress!.toString(),
        ),
      );
    } catch (error) {
      this.logger.error(
        `Error checking NFT ownership for ${userWalletAddress}`,
        error,
      );
      return false;
    }
  }

  private validateConfiguration(): void {
    if (!this.merkleTreeAddress || !this.collectionAddress) {
      throw new Error(
        'Service not properly configured. Create collection and merkle tree first.',
      );
    }
  }
}
