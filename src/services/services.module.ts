import { Module } from '@nestjs/common';
import { SolanaService } from './solana/solana.service';
import { DatabaseModule } from '../database';
import { MetaplexService } from './metaplex/metaplex.service';
import { CronJobsService } from './cron-jobs/cron-jobs.service';
import { JupiterApiService } from './jupiter-api/jupiter-api.service';
import { KaminoApiService } from './kamino-service/kamino-api.service';
import { VaultService } from './vault/vault.service';
import { TransactionService } from './transaction/transaction.service';
import { JupiterBuilder } from './transaction/builders/jupiter.builder';
import { BuilderFactory } from './transaction/builders/builder.factory';
import { QuoteService } from './quote/quote.service';
import { JupiterQuoteAdapter } from './quote/adapters/jupiter-quote.adapter';
import { StrategyService } from './strategy/strategy.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UserService } from './user/user.service';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  providers: [
    SolanaService,
    MetaplexService,
    CronJobsService,
    JupiterApiService,
    KaminoApiService,
    VaultService,
    TransactionService,
    JupiterBuilder,
    BuilderFactory,
    QuoteService,
    JupiterQuoteAdapter,
    StrategyService,
    UserService,
  ],
  exports: [
    SolanaService,
    MetaplexService,
    VaultService,
    TransactionService,
    QuoteService,
    StrategyService,
    UserService,
  ],
})
export class ServicesModule {}
