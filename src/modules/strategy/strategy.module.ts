import { Module } from '@nestjs/common';
import { StrategyController } from './strategy.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StrategyService } from './strategy.service';

@Module({
  imports: [PrismaModule],
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}
