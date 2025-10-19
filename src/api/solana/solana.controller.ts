import { Body, Controller, Post } from '@nestjs/common';
import { SolanaService } from '../../services/solana/solana.service';
import { PublicKey } from '@solana/web3.js';
import { QuoteDepositDto } from '../../dto';
import BN from 'bn.js';

@Controller('solana')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @Post('/quote/deposit')
  async quoteDeposit(@Body() dto: QuoteDepositDto) {
    const signer = new PublicKey(dto.signer);
    const vaultId = new PublicKey(dto.vaultId);
    const inputMint = new PublicKey(dto.inputMint);
    const lpMint = new PublicKey(dto.lpMint);
    const amount = new BN(dto.amount);

    // return this.solanaService.quoteDeposit({
    //   signer,
    //   vaultId,
    //   inputMint,
    //   lpMint,
    //   amount,
    //   ensureAtas: dto.ensureAtas,
    // });
  }
}
