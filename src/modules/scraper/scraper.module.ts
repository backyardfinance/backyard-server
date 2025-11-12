import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { TwitterService } from './twitter-scraper.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule {}
