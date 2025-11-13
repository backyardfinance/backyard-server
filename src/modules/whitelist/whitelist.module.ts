import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WhitelistController } from './whitelist.controller';
import { WhitelistService } from './whitelist.service';

@Module({
  imports: [PrismaModule],
  controllers: [WhitelistController],
  providers: [WhitelistService],
  exports: [WhitelistService],
})
export class WhitelistModule {}
