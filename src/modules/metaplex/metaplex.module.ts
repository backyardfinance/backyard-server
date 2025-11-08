import { Module } from '@nestjs/common';
import { MetaplexService } from './metaplex.service';

@Module({
  controllers: [],
  providers: [MetaplexService],
  exports: [MetaplexService],
})
export class MetaplexModule {}
