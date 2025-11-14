import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

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
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          { name: 'short', ttl: 300000, limit: 5 }, // 5 minutes
          { name: 'medium', ttl: 600000, limit: 5 }, // 10 minutes
          { name: 'long', ttl: 1800000, limit: 20 }, // 30 minutes
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis(config.get<string>('REDIS')),
        ),
      }),
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
