import { Logger, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  exports: [DatabaseService],
  providers: [DatabaseService, Logger],
})
export class DatabaseModule {}
