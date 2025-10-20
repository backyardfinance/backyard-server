import { Module } from '@nestjs/common';
import { SolanaService } from './solana/solana.service';
import { DatabaseModule } from '../database';
import { MetaplexService } from './metaplex/metaplex.service';

@Module({
  imports: [DatabaseModule],
  providers: [SolanaService, MetaplexService],
  exports: [SolanaService, MetaplexService],
})
export class ServicesModule {}
