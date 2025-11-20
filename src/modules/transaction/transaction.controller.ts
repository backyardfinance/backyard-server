import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateDepositTransactionsDto } from './dto/create-deposit-transactions.dto';
import { CreateDepositTransactionsResponseDto } from './dto/create-deposit-transactions-response.dto';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create-deposits')
  @ApiOkResponse({ type: [CreateDepositTransactionsResponseDto] })
  async createDepositTransactions(
    @Body() body: CreateDepositTransactionsDto,
  ): Promise<CreateDepositTransactionsResponseDto[]> {
    return this.transactionService.createDepositTransactions(body);
  }
}
