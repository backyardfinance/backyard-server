import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { QuoteService } from './quote.service';
import { QuoteResponseDto } from './dto/quote-response.dto';
import { GetQuoteDto } from './dto/get-quote.dto';

@Controller('quote')
@ApiTags('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiResponse({
    type: [QuoteResponseDto],
  })
  async getQuote(@Body() dto: GetQuoteDto): Promise<QuoteResponseDto> {
    return this.quoteService.getQuote(dto);
  }
}
