import { Module } from '@nestjs/common';
import { SolanaService } from './solana/solana.service';
import { MetaplexService } from './metaplex/metaplex.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SolanaService, MetaplexService],
  exports: [SolanaService, MetaplexService],
})
export class ServicesModule {}
