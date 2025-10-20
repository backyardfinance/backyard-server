import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { SolanaController } from './solana/solana.controller';
import { DatabaseModule } from '../database';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [ServicesModule, DatabaseModule],
  controllers: [SolanaController, AdminController],
  providers: [],
})
export class ApiModule {}
