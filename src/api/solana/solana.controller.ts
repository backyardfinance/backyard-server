import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SolanaService } from '../../services/solana/solana.service';
import { CreateStrategyDto } from '../../dto';
import { DatabaseService } from '../../database';
import { Strategy } from '@prisma/client';

@Controller('solana')
export class SolanaController {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly db: DatabaseService,
  ) {}

  // add yard reward and total apy - for hover UI
  // add user optional param and for him add user positon --

  // add vault_name -search, and add platform name

  // for interest earned -> query underlying vault for LP token and get its price with CRON
  // EASY -> total_pos -> deposited + interest earned

  // make arr of vaults and dep amount
  @Post('strategy/create')
  async createStrategy(@Body() dto: CreateStrategyDto): Promise<Strategy> {
    return await this.solanaService.createStrategy(
      dto.vaultId,
      dto.deposited_amount,
      dto.userId,
    );
  }

  @Get('/user-tokens/:userId')
  async getUserTokens(@Param('userId') userId: string) {
    return await this.solanaService.getUserTokens(userId);
  }

  // endpoint -> vaults total deposits, CRON -> get vault underlying TVL by cron, and aggregate backyard TVL in tkn and total = both added, also in USD
  // possibly in get all vaults endpoint, also get native APY from native vault SC, total APY = native APY + YARD reward

  // graph endpoint vault overview -> apy in perc, TVL in tkn, asset price in USD

  // graph endpoint vault my position -> deposited + interest earned & yard reward arr(2 arrays)

  // graph endpoint vault my position APY -> daily native APY + yard reward
}
