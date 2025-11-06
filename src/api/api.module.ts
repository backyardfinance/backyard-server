import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { SolanaController } from './solana/solana.controller';
import { DatabaseModule } from '../database';
import { AdminController } from './admin/admin.controller';
import { VaultController } from './vault/vault.controller';
import { TransactionController } from './transaction/transaction.controller';
import { QuoteController } from './quote/quote.controller';
import { StrategyController } from './strategy/strategy.controller';
import { UserController } from './user/user.controller';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [ServicesModule, DatabaseModule],
  controllers: [
    SolanaController,
    AdminController,
    VaultController,
    TransactionController,
    QuoteController,
    StrategyController,
    UserController,
    AuthController,
  ],
  providers: [],
})
export class ApiModule {}
