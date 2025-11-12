import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { VerificationService } from './verification/verification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TwitterModule } from '../scraper/scraper.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, TwitterModule, MailModule],
  controllers: [UserController],
  providers: [UserService, VerificationService],
  exports: [UserService],
})
export class UserModule {}
