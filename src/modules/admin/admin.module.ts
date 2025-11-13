import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SolanaModule } from '../solana/solana.module';
import { MetaplexModule } from '../metaplex/metaplex.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SolanaModule, MetaplexModule, UserModule],
  controllers: [AdminController],
  providers: [AdminController],
  exports: [AdminController],
})
export class AdminModule {}
