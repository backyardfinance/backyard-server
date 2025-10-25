import { Connection, PublicKey } from '@solana/web3.js';
import { QuoteVaultDto } from '../dto/quote-response.dto';
import { QuoteAdapter } from '../quote-adapter.interface';
import { Injectable } from '@nestjs/common';
import { Vault, VaultPlatform } from '@prisma/client';
// @ts-ignore
import { getDepositContext } from '@jup-ag/lend/earn';

@Injectable()
export class JupiterQuoteAdapter implements QuoteAdapter {
  private readonly connection: Connection;

  constructor() {
    const rpc = 'https://solana-mainnet.gateway.tatum.io';
    this.connection = new Connection(rpc, 'confirmed');
  }

  async fetchQuote(
    vaultData: Vault,
    walletAddress: PublicKey,
    amount: string,
  ): Promise<QuoteVaultDto> {
    const vaultId = vaultData.id;
    const vaultPubkey = vaultData.public_key;
    const ourVaultLp = vaultData.our_lp_mint;
    const inputVaultToken = vaultData.input_token_mint;

    const depositContext = await getDepositContext({
      asset: new PublicKey(inputVaultToken),
      signer: walletAddress,
      connection: this.connection,
    });

    const dto: QuoteVaultDto = {
      vaultId,
      vaultPubkey,
      platform: VaultPlatform.Jupiter,
      amount,
      accounts: {
        inputToken: inputVaultToken,
        lpToken: ourVaultLp,
        fTokenMint: depositContext.fTokenMint.toString(),
        jupiterVault: depositContext.vault.toString(),
        lending: depositContext.lending.toString(),
        lendingAdmin: depositContext.lendingAdmin.toString(),
        rewardsRateModel: depositContext.rewardsRateModel.toString(),
        lendingSupplyPositionOnLiquidity:
          depositContext.lendingSupplyPositionOnLiquidity.toString(),
        liquidity: depositContext.liquidity.toString(),
        liquidityProgram: depositContext.liquidityProgram.toString(),
        rateModel: depositContext.rateModel.toString(),
        supplyTokenReservesLiquidity:
          depositContext.supplyTokenReservesLiquidity.toString(),
      },
    };

    return dto;
  }
}
