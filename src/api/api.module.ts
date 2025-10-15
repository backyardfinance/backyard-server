import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { SolanaController } from './solana/solana.controller';

@Module({
  imports: [ServicesModule],
  controllers: [SolanaController],
  providers: [],
})
export class ApiModule {}
