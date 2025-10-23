import {
  AnchorProvider,
  BN,
  Idl,
  Program,
  Provider,
  Wallet,
} from '@coral-xyz/anchor';
import { Injectable } from '@nestjs/common';
import {
  Connection,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import idl from '../../idl/backyard_programs.json';
import { CreateDepositDto } from './dto';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

@Injectable()
export class DepositService {
  private readonly program: Program;
  private readonly connection: Connection;

  constructor() {
    const dummy = Keypair.generate();
    const wallet: Wallet = {
      publicKey: dummy.publicKey,
      payer: dummy,
      signAllTransactions: async (txs) => txs,
      signTransaction: async (tx) => tx,
    } as any;

    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });

    this.program = new Program(idl as Idl, provider as Provider);
  }

  async createTransaction(dto: CreateDepositDto) {
    const { protocolIndex, vaultId, amount, signer, inputToken, lpMint } = dto;
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('finalized');

    const ix = await this.program.methods
      .deposit(protocolIndex, vaultId, amount)
      .accounts({
        signer: signer,
        inputToken: inputToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        lpToken: lpMint,
      })
      .instruction();

    const messageV0 = new TransactionMessage({
      payerKey: signer,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToV0Message();

    const tx = new VersionedTransaction(messageV0);
    const serializedTransaction = Buffer.from(tx.serialize()).toString(
      'base64',
    );
    return { serializedTransaction, blockhash, lastValidBlockHeight };
  }
}
