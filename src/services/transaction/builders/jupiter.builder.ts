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
import idl from '../../../idls/backyard_programs.json';
import { JupiterAccountsDto } from '../dto/jupiter-accounts.dto';
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';

@Injectable()
export class JupiterBuilder implements ProtocolBuilder {
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

    // TODO:
    const rpc = 'https://solana-mainnet.gateway.tatum.io';
    this.connection = new Connection(rpc, 'confirmed');
  }

  buildInstruction(
    data: QuoteVaultDataDto,
    signer: PublicKey,
  ): Promise<TransactionInstruction> {
    const { vaultId, amount, accounts } = data;
    const jupiterAccounts = accounts as JupiterAccountsDto;

    return this.program.methods
      .deposit(vaultId, new BN(amount))
      .accounts({
        signer: signer,
        inputToken: new PublicKey(jupiterAccounts.inputToken),
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenProgram2022: TOKEN_2022_PROGRAM_ID,
        lpToken: new PublicKey(jupiterAccounts.lpToken),
        fTokenMint: new PublicKey(jupiterAccounts.fTokenMint),
        jupiterVault: new PublicKey(jupiterAccounts.jupiterVault),
        lending: new PublicKey(jupiterAccounts.lending),
        lendingAdmin: new PublicKey(jupiterAccounts.lendingAdmin),
        rewardsRateModel: new PublicKey(jupiterAccounts.rewardsRateModel),
        lendingSupplyPositionOnLiquidity: new PublicKey(
          jupiterAccounts.lendingSupplyPositionOnLiquidity,
        ),
        liquidity: new PublicKey(jupiterAccounts.liquidity),
        liquidityProgram: new PublicKey(jupiterAccounts.liquidityProgram),
        rateModel: new PublicKey(jupiterAccounts.rateModel),
        supplyTokenReservesLiquidity: new PublicKey(
          jupiterAccounts.supplyTokenReservesLiquidity,
        ),
      })
      .instruction();
  }
}
