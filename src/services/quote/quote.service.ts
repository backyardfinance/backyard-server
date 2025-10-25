import { Injectable } from '@nestjs/common';
import { JupiterQuoteAdapter } from './adapters/jupiter-quote.adapter';
import { GetQuoteDto } from './dto/get-quote.dto';
import { DatabaseService } from 'src/database';
import { PublicKey } from '@solana/web3.js';
import { VaultPlatform } from '@prisma/client';

@Injectable()
export class QuoteService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jupiterAdapter: JupiterQuoteAdapter,
  ) {}

  async getQuote(dto: GetQuoteDto) {
    const { walletAddress, vaultIds } = dto;

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

    const quotes = await Promise.all(
      vaults.map((vault) =>
        this.fetchVaultQuote(vault, new PublicKey(walletAddress)),
      ),
    );

    return {
      signer: walletAddress,
      vaults: quotes,
    };
  }

  private async fetchVaultQuote(vault: any, walletAddress: PublicKey) {
    const adapter = this.getAdapter(vault.platform);
    return adapter.fetchQuote(vault, walletAddress);
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
