import { Injectable } from '@nestjs/common';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { BACKYARD_PROGRAMS_IDL } from '../../idl';
import { ConfigService } from '../../config/config.module';
import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeNonTransferableMintInstruction,
  ExtensionType,
  getMintLen,
  createInitializeMint2Instruction,
} from '@solana/spl-token';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || '9J4gV4TL8EifN1PJGtysh1wp4wgzYoprZ4mYo8kS2PSv',
);

@Injectable()
export class SolanaService {
  readonly connection: Connection;
  readonly program: anchor.Program;
  readonly master: Keypair;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const rpc =
      this.config.get<string>('rpc_url') || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpc, 'confirmed');

    const dummy = Keypair.generate();
    const wallet: anchor.Wallet = {
      publicKey: dummy.publicKey,
      payer: dummy,
      signAllTransactions: async (txs) => txs,
      signTransaction: async (tx) => tx,
    } as any;

    const provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });

    this.program = new anchor.Program(
      BACKYARD_PROGRAMS_IDL as anchor.Idl,
      provider as anchor.Provider,
    );

    const masterJson = this.config.get<string>('master_wallet_private_key');
    if (masterJson) {
      const secret = Uint8Array.from(JSON.parse(masterJson));
      this.master = Keypair.fromSecretKey(secret);
    }
  }

  async createVault(protocolName: string) {
    // vault id = public key; in db it's a public_key field
    const vaultId = Keypair.generate().publicKey;

    const tx = new Transaction();

    const ix = await this.program.methods
      .createVault(vaultId)
      .accounts({})
      .instruction();

    tx.add(ix);

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.feePayer = this.master.publicKey;
    tx.sign(this.master);

    const sig = await this.connection.sendRawTransaction(tx.serialize());
    const conf = await this.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      'confirmed',
    );

    if (conf.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(conf.value.err)}`);
    }

    // push vault to db
    const vault = await this.prisma.vault.create({
      data: {
        public_key: vaultId.toString(),
        name: 'jupiter',
        tvl: 0,
        apy: 0,
      },
    });

    const vaultPdaAddress = this.getVaultPda(vaultId);

    return {
      signature: sig,
      confirmation: conf.value,
      vault: {
        id: vault.id,
        publicKey: vault.public_key,
        name: vault.name,
      },
      vaultPdaAddress,
    };
  }

  async createLP(
    mintAuthority: PublicKey,
    mintKeypair: Keypair = Keypair.generate(),
  ) {
    const extensions = [ExtensionType.NonTransferable];
    const mintLen = getMintLen(extensions);
    const lamports =
      await this.connection.getMinimumBalanceForRentExemption(mintLen);

    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: this.master.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const initializeNonTransferableIx =
      createInitializeNonTransferableMintInstruction(
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID,
      );

    const initializeMintIx = createInitializeMint2Instruction(
      mintKeypair.publicKey,
      6,
      // TODO: PDA here
      mintAuthority,
      mintAuthority,
      TOKEN_2022_PROGRAM_ID,
    );

    const setupTx = new Transaction().add(
      createAccountIx,
      initializeNonTransferableIx,
      initializeMintIx,
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      setupTx,
      [this.master, mintKeypair],
    );

    return {
      signature,
      mint: mintKeypair.publicKey.toBase58(),
      authority: mintAuthority.toBase58(),
    };
  }

  private getVaultPda(vaultId: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), vaultId.toBuffer()],
      PROGRAM_ID,
    )[0];
  }
}
