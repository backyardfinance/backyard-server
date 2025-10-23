import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { SolanaController } from './solana/solana.controller';
import { DatabaseModule } from '../database';
import { AdminController } from './admin/admin.controller';
import { VaultController } from './vault/vault.controller';
import { DepositController } from './deposit/deposit.controller';

@Module({
  imports: [ServicesModule, DatabaseModule],
  controllers: [
    SolanaController,
    AdminController,
    VaultController,
    DepositController,
  ],
  providers: [],
})
export class ApiModule {}
