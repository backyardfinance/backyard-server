import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { StrategyService } from '../../services/strategy/strategy.service';
import { CreateStrategyDto, StrategyInfoResponse } from '../../dto';

@Controller('strategies')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Get('/user/:userId')
  async getStrategies(
    @Param('userId') userId: string,
  ): Promise<StrategyInfoResponse[]> {
    return this.strategyService.getStrategiesInfo(userId);
  }

  @Get('/:strategyId')
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
  async create(@Body() dto: CreateStrategyDto) {
    return this.strategyService.createStrategy(
      dto.userId,
      dto.name,
      dto.vaultDeposits,
    );
  }
}
