import { Module } from '@nestjs/common';
import { SolanaService } from './solana/solana.service';
import { DatabaseModule } from '../database';
import { MetaplexService } from './metaplex/metaplex.service';
import { CronJobsService } from './cron-jobs/cron-jobs.service';
import { JupiterApiService } from './jupiter-api/jupiter-api.service';
import { KaminoApiService } from './kamino-service/kamino-api.service';
import { VaultService } from './vault/vault.service';
import { StrategyService } from './strategy/strategy.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    SolanaService,
    MetaplexService,
    CronJobsService,
    JupiterApiService,
    KaminoApiService,
    VaultService,
    StrategyService,
  ],
  exports: [SolanaService, MetaplexService, VaultService, StrategyService],
})
export class ServicesModule {}
