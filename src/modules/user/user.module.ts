import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { VerificationService } from './verification/verification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TwitterModule } from '../scraper/scraper.module';
import { MailModule } from '../mail/mail.module';
import { MetaplexModule } from '../metaplex/metaplex.module';
import { WhitelistModule } from '../whitelist/whitelist.module';

@Module({
  imports: [
    PrismaModule,
    TwitterModule,
    MailModule,
    MetaplexModule,
    WhitelistModule,
  ],
  controllers: [UserController],
  providers: [UserService, VerificationService],
  exports: [UserService],
})
export class UserModule {}
