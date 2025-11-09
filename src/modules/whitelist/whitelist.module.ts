import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WhitelistController } from './whitelist.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WhitelistController],
  providers: [],
})
export class WhitelistModule {}
