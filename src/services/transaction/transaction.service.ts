import { Injectable } from '@nestjs/common';
import { BuilderFactory } from './builders/builder.factory';
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { VaultPlatform } from '@prisma/client';
import { CreateDepositTransactionsDto } from './dto/create-deposit-transactions.dto';
import { QuoteVaultDataDto } from './dto/quote-vault-data.dto';

@Injectable()
export class TransactionService {
  private connection: Connection;

  constructor(private readonly builderFactory: BuilderFactory) {
    // TODO: create a provider
    const rpc = 'https://solana-mainnet.gateway.tatum.io';
    this.connection = new Connection(rpc, 'confirmed');
  }

  async createDepositTransactions(dto: CreateDepositTransactionsDto) {
    const { signer, vaults } = dto;

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('finalized');

    const transactions = await Promise.all(
      vaults.map((vault) =>
        this.buildTransaction(
          vault,
          new PublicKey(signer),
          blockhash,
          lastValidBlockHeight,
        ),
      ),
    );

    return transactions;
  }

  private async buildTransaction(
    vaultData: QuoteVaultDataDto,
    signer: PublicKey,
    blockhash: string,
    lastValidBlockHeight: number,
  ) {
    const builder = this.builderFactory.getBuilder(VaultPlatform.Jupiter);

    const ix = await builder.buildInstruction(vaultData, signer);

    const messageV0 = new TransactionMessage({
      payerKey: signer,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToV0Message();

    const tx = new VersionedTransaction(messageV0);

    const serializedTransaction = Buffer.from(tx.serialize()).toString(
      'base64',
    );

    return {
      serializedTransaction,
      blockhash,
      lastValidBlockHeight,
      vaultId: vaultData.vaultId,
      platform: vaultData.platform,
    };
  }
}
