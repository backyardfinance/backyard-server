import { Module } from '@nestjs/common';
import { CronService } from './cron.service';

@Module({
  providers: [CronService],
  exports: [],
})
export class CronModule {}
