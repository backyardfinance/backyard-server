import { Module } from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';
import { JupiterQuoteAdapter } from './adapters/jupiter-quote.adapter';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuoteController],
  providers: [QuoteService, JupiterQuoteAdapter],
})
export class QuoteModule {}
