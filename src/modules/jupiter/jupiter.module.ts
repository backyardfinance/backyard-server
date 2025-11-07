import { Module } from '@nestjs/common';
import { JupiterApiService } from './jupiter-api.service';

@Module({
  providers: [JupiterApiService],
  exports: [JupiterApiService],
})
export class VaultModule {}
