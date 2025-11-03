import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetQuoteDto } from 'src/services/quote/dto/get-quote.dto';
import { QuoteService } from 'src/services/quote/quote.service';
import { QuoteResponseDto } from 'src/services/quote/dto/quote-response.dto';

@Controller('quote')
@ApiTags('quote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiResponse({
    type: QuoteResponseDto,
  })
  async getQuote(@Body() dto: GetQuoteDto): Promise<QuoteResponseDto> {
    return this.quoteService.getQuote(dto);
  }
}
