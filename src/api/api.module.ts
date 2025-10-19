import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { SolanaController } from './solana/solana.controller';
import { DatabaseModule } from '../database';

@Module({
  imports: [ServicesModule, DatabaseModule],
  controllers: [SolanaController],
  providers: [],
})
export class ApiModule {}
