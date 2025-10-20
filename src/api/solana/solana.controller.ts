import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SolanaService } from '../../services/solana/solana.service';
import { PublicKey } from '@solana/web3.js';
import { CreateStrategyDto, QuoteDepositDto } from '../../dto';
import BN from 'bn.js';
import { DatabaseService } from '../../database';
import { Strategy } from '@prisma/client';

@Controller('solana')
export class SolanaController {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly db: DatabaseService,
  ) {}

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

  @Get('/vaults')
  async getAllVaults() {
    const vaults = await this.db.vault.findMany();
    return vaults.map((v) => ({
      ...v,
      tvl: parseFloat(v.tvl.toString()),
      apy: parseFloat(v.apy.toString()),
    }));
  }

  @Post('strategy/create')
  async createStrategy(@Body() dto: CreateStrategyDto): Promise<Strategy> {
    return await this.solanaService.createStrategy(
      dto.vaultId,
      dto.deposited_amount,
      dto.userId,
    );
  }

  @Get('strategies/:userId')
  async getStrategies(@Param('userId') userId: string) {
    return await this.solanaService.getStrategies(userId);
  }

  @Get('/user-tokens/:userId')
  async getUserTokens(@Param('userId') userId: string) {
    return await this.solanaService.getUserTokens(userId);
  }
}
