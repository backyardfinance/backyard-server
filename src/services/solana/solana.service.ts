import { Injectable } from '@nestjs/common';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { BACKYARD_PROGRAMS_IDL } from '../../idl';
import { ConfigService } from '../../config/config.module';
import BN from 'bn.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getMint,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || '9J4gV4TL8EifN1PJGtysh1wp4wgzYoprZ4mYo8kS2PSv',
);

@Injectable()
export class SolanaService {
  readonly connection: Connection;
  readonly program: anchor.Program;
  readonly master?: Keypair;

  constructor(private readonly config: ConfigService) {
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

    console.log('vaultId: ', Keypair.generate().publicKey);

    console.log('MASTER pubkey =', this.master?.publicKey.toBase58());

    const kp = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(process.env.MASTER_WALLET_PRIVATE_KEY!)),
    );
    console.log(kp.publicKey.toBase58());
  }

  private async ensureFunds(
    pubkey: PublicKey,
    minLamports = 0.05 * LAMPORTS_PER_SOL,
  ) {
    const bal = await this.connection.getBalance(pubkey, 'confirmed');
    if (bal >= minLamports) return;
    const sig = await this.connection.requestAirdrop(
      pubkey,
      1 * LAMPORTS_PER_SOL,
    );
    const latest = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction(
      { signature: sig, ...latest },
      'confirmed',
    );
  }

  vaultPda(vaultId: PublicKey) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), vaultId.toBuffer()],
      PROGRAM_ID,
    );
    return pda;
  }

  public async adminCreateVault(vaultId: PublicKey) {
    if (!this.master)
      throw new Error('MASTER_WALLET_PRIVATE_KEY not configured');

    const vault = this.vaultPda(vaultId);

    const tx = new Transaction();

    const ix = await this.program.methods
      .createVault(vaultId)
      .accounts({
        master: this.master.publicKey,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    tx.add(ix);

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.feePayer = this.master.publicKey;

    tx.sign(this.master);

    await this.ensureFunds(this.master.publicKey);

    const sig = await this.connection.sendRawTransaction(tx.serialize());
    const conf = await this.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      'confirmed',
    );

    // push vault to db

    return {
      signature: sig,
      vault: vault.toBase58(),
      confirmation: conf.value,
    };
  }

  // get vaults from db by user addr
}
