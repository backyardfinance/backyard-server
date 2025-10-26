import { Injectable } from '@nestjs/common';
import { JupiterQuoteAdapter } from './adapters/jupiter-quote.adapter';
import { GetQuoteDto } from './dto/get-quote.dto';
import { DatabaseService } from 'src/database';
import { PublicKey } from '@solana/web3.js';
import { Vault, VaultPlatform } from '@prisma/client';
import { VaultData } from './quote-adapter.interface';

@Injectable()
export class QuoteService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jupiterAdapter: JupiterQuoteAdapter,
  ) {}

  async getQuote(dto: GetQuoteDto) {
    const { walletAddress, deposits } = dto;

    const vaultIds = deposits.map((d) => d.vaultId);

    const vaults = await this.db.vault.findMany({
      where: {
        id: {
          in: vaultIds,
        },
      },
    });

    if (vaults.length === 0) {
      throw new Error('No vaults found');
    }

    const amountMap = new Map(deposits.map((d) => [d.vaultId, d.amount]));

    const quotes = await Promise.all(
      vaults.map((vault) => {
        return this.fetchVaultQuote(
          vault,
          new PublicKey(walletAddress),
          amountMap.get(vault.id),
        );
      }),
    );

    return {
      signer: walletAddress,
      vaults: quotes,
    };
  }

  private async fetchVaultQuote(
    vault: Vault,
    walletAddress: PublicKey,
    amount: string,
  ) {
    const adapter = this.getAdapter(vault.platform);
    return adapter.fetchQuote(vault, walletAddress, amount);
  }

  private getAdapter(platform: VaultPlatform) {
    switch (platform) {
      case VaultPlatform.Jupiter:
        return this.jupiterAdapter;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
