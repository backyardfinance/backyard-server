import { Module } from '@nestjs/common';
import { SolanaService } from './solana/solana.service';

@Module({
  imports: [],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class ServicesModule {}
