import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetQuoteDto } from 'src/services/quote/dto/get-quote.dto';
import { QuoteService } from 'src/services/quote/quote.service';

@Controller('quote')
@ApiTags('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  async getQuote(@Body() dto: GetQuoteDto) {
    return this.quoteService.getQuote(dto);
  }
}
