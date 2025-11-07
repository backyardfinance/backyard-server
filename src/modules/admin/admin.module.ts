import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminController],
  exports: [AdminController],
})
export class AdminModule {}
