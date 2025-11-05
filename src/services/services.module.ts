import { Module } from '@nestjs/common';
import * as path from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '../config/config.module';
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
import { UserService } from './user/user.service';
import { QueueModule } from '../queue/queue.module';
import { EmailService } from './email/email.service';
import { VerificationService } from './user/verification/verification.service';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    QueueModule.forRoot({
      interval: 1000,
      intervalCap: 3,
      concurrency: 1,
      autoStart: true,
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isTest = configService.get('app_test_mode');
        if (isTest) {
          return {
            transport: {
              host: configService.get('mail.host'),
              port: Number(configService.get('mail.port') ?? 1025),
              secure: false,
              ignoreTLS: true,
            },
            defaults: {
              from: configService.get('mail.mail_from_name_and_address'),
            },
            template: {
              dir: path.resolve(__dirname, 'email', 'templates'),
              adapter: new HandlebarsAdapter(),
            },
          };
        }

        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: configService.get('mail.user'),
              pass: configService.get('mail.gmailAppPassword'),
            },
          },
          defaults: {
            from: configService.get('mail.mail_from_name_and_address'),
          },
          template: {
            dir: path.resolve(__dirname, 'email', 'templates'),
            adapter: new HandlebarsAdapter(),
          },
        };
      },
    }),
  ],
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
    EmailService,
    VerificationService,
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
