import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { JupiterBuilder } from './builders/jupiter.builder';
import { BuilderFactory } from './builders/builder.factory';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionController],
  providers: [TransactionService, JupiterBuilder, BuilderFactory],
  exports: [TransactionService],
})
export class TransactionModule {}
