import { Module } from '@nestjs/common';
import { MetaplexService } from './metaplex.service';
import { MetaplexCNft } from './metaplex-cnft';

@Module({
  controllers: [],
  providers: [MetaplexService, MetaplexCNft],
  exports: [MetaplexService, MetaplexCNft],
})
export class MetaplexModule {}
