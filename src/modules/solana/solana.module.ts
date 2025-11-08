import { Module } from '@nestjs/common';
import { SolanaController } from './solana.controller';
import { SolanaService } from './solana.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SolanaController],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}
