import {
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { ProtocolBuilder } from '../interfaces/protocol-builder.interface';
import { Injectable } from '@nestjs/common';
import { QuoteVaultDataDto } from '../dto/quote-vault-data.dto';
import {
  AnchorProvider,
  BN,
  Idl,
  Program,
  Provider,
  Wallet,
} from '@coral-xyz/anchor';
import idl from '../../../idls/backyard_programs_dev.json';
import { BackyardPrograms } from 'src/idls/backyard_programs_dev';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { DatabaseService } from 'src/database';
import { QuoteType } from 'src/services/quote/dto/quote-type.enum';

@Injectable()
export class JupiterBuilder implements ProtocolBuilder {
  private readonly program: Program<BackyardPrograms>;
  private readonly connection: Connection;

  constructor(private readonly db: DatabaseService) {
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

    // TODO:
    const rpc = 'https://solana-mainnet.gateway.tatum.io';
    this.connection = new Connection(rpc, 'confirmed');
  }

  async buildInstruction(
    data: QuoteVaultDataDto,
    signer: PublicKey,
    type: QuoteType,
  ): Promise<TransactionInstruction> {
    if (type === QuoteType.DEPOSIT) {
      return this.buildDepositInstruction(data, signer);
    } else {
      return this.buildWithdrawInstruction(data, signer);
    }
  }

  private async buildDepositInstruction(
    data: QuoteVaultDataDto,
    signer: PublicKey,
  ) {
    const { vaultId, amount } = data;

    const vault = await this.db.vault.findUnique({
      where: {
        id: vaultId,
      },
    });

    const vaultPubkey = new PublicKey(vault.public_key);
    const inputToken = new PublicKey(vault.input_token_mint);
    const lpToken = new PublicKey(vault.our_lp_mint);

    return this.program.methods
      .deposit(vaultPubkey, new BN(amount))
      .accounts({
        signer,
        inputToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        lpToken,
      })
      .instruction();
  }

  private async buildWithdrawInstruction(
    data: QuoteVaultDataDto,
    signer: PublicKey,
  ) {
    const { vaultId, amount } = data;

    const vault = await this.db.vault.findUnique({
      where: {
        id: vaultId,
      },
    });
    const vaultPubkey = new PublicKey(vault.public_key);
    const outputToken = new PublicKey(vault.input_token_mint);
    const lpToken = new PublicKey(vault.our_lp_mint);

    return this.program.methods
      .withdraw(vaultPubkey, new BN(amount))
      .accounts({
        signer,
        outputToken,
        lpToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
      })
      .instruction();
  }
}
