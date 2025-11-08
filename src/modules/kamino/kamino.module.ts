import { Module } from '@nestjs/common';
import { KaminoApiService } from './kamino-api.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [KaminoApiService],
  exports: [KaminoApiService],
})
export class KaminoModule {}
