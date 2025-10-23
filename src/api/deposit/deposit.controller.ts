import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DepositService } from 'src/services/deposit/deposit.service';
import { CreateDepositDto } from 'src/services/deposit/dto';
import { CreateDepositRequest } from './request';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

@Controller('deposit')
@ApiTags('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post('transactions')
  async createDepositTransactions(@Body() body: CreateDepositRequest) {
    const dto: CreateDepositDto = {
      protocolIndex: body.protocolIndex,
      vaultId: new PublicKey(body.vaultId),
      amount: new BN(body.amount),
      signer: new PublicKey(body.signer),
      inputToken: new PublicKey(body.inputToken),
      lpMint: new PublicKey(body.lpMint),
    };
    return this.depositService.createTransaction(dto);
  }
}
