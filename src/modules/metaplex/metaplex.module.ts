import { Module } from '@nestjs/common';
import { MetaplexService } from './metaplex.service';
import { MetaplexCNftService } from './metaplex-cnft';

@Module({
  controllers: [],
  providers: [MetaplexService, MetaplexCNftService],
  exports: [MetaplexService, MetaplexCNftService],
})
export class MetaplexModule {}
