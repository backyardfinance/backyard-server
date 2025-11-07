import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { VerificationService } from './verification/verification.service';

@Module({
  controllers: [UserController],
  providers: [UserService, VerificationService],
  exports: [UserService],
})
export class UserModule {}
