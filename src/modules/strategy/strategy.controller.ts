import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  CreateStrategyDto,
  PortfolioHistoryPoint,
  StrategyHistoryPoint,
  StrategyInfoResponse,
} from '../../dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { WalletToUserPipe } from '../../common/pipes/wallet-to-user-pipe';
import { StrategyService } from './strategy.service';
import { CreateStrategyResponseDto } from './dto/create-strategy-response.dto';

@Controller('strategies')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get('/user/:walletAddress')
  @ApiOkResponse({ type: StrategyInfoResponse, isArray: true })
  async getStrategies(
    @Param('walletAddress', WalletToUserPipe) userId: string,
  ): Promise<StrategyInfoResponse[]> {
    return this.strategyService.getStrategiesInfo(userId);
  }

  @Get('/:strategyId/history')
  @ApiOkResponse({ type: StrategyHistoryPoint, isArray: true })
  async getStrategyHistory(
    @Param('strategyId') strategyId: string,
  ): Promise<StrategyHistoryPoint[]> {
    return this.strategyService.getStrategyHistory(strategyId);
  }

  @Get('portfolio/history/:walletAddress')
  @ApiOkResponse({ type: StrategyHistoryPoint, isArray: true })
  async getPortfolioHistory(
    @Param('walletAddress', WalletToUserPipe) userId: string,
  ): Promise<PortfolioHistoryPoint[]> {
    return this.strategyService.getUserPortfolioHistory(userId);
  }

  @Get('/:strategyId')
  @ApiOkResponse({ type: StrategyInfoResponse })
  async getStrategy(
    @Param('strategyId') strategyId: string,
  ): Promise<StrategyInfoResponse> {
    return this.strategyService.getStrategyInfo(strategyId);
  }

  @Delete('/:strategyId')
  async deleteStrategy(@Param('strategyId') strategyId: string) {
    return this.strategyService.deleteStrategy(strategyId);
  }

  @Post('create')
  @ApiOkResponse({ type: CreateStrategyResponseDto })
  async create(
    @Body() dto: CreateStrategyDto,
  ): Promise<CreateStrategyResponseDto> {
    return this.strategyService.createStrategy(
      dto.walletAddress,
      dto.name,
      dto.vaultDeposits,
    );
  }
}
