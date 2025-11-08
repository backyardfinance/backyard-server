import { Module } from '@nestjs/common';
import { JupiterApiService } from './jupiter-api.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [JupiterApiService],
  exports: [JupiterApiService],
})
export class JupiterModule {}
