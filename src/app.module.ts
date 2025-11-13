import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from './config/config.module';
import configuration from './config/configuration';
import { VaultModule } from './modules/vault/vault.modules';
import { SolanaModule } from './modules/solana/solana.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { UserModule } from './modules/user/user.module';
import { MetaplexModule } from './modules/metaplex/metaplex.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JupiterModule } from './modules/jupiter/jupiter.module';
import { KaminoModule } from './modules/kamino/kamino.module';
import { WhitelistModule } from './modules/whitelist/whitelist.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { TransactionModule } from './modules/transaction/transaction.module';
import { QuoteModule } from './modules/quote/quote.module';
import { CronModule } from './modules/cron/cron.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule(configuration),
    CacheModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (config: ConfigService) => {
        const redis = new KeyvRedis(config.get<string>('REDIS'));
        return {
          stores: [redis],
        };
      },
    }),
    // CronModule,
    AdminModule,
    PrismaModule,
    VaultModule,
    SolanaModule,
    AuthModule,
    UserModule,
    MailModule,
    MetaplexModule,
    StrategyModule,
    JupiterModule,
    KaminoModule,
    WhitelistModule,
    TransactionModule,
    QuoteModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
