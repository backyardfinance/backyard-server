import { Module } from '@nestjs/common';
import { SolanaService } from './solana/solana.service';
import { DatabaseModule } from '../database';

@Module({
  imports: [DatabaseModule],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class ServicesModule {}
