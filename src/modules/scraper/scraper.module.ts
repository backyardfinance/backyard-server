import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TwitterService } from './twitter-scraper.service';

@Module({
  imports: [PrismaModule],
  providers: [TwitterService],
  exports: [TwitterService],
})
export class TwitterModule {}
