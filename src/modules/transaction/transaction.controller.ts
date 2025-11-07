import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateDepositTransactionsDto } from './dto/create-deposit-transactions.dto';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create-deposits')
  async createDepositTransactions(@Body() body: CreateDepositTransactionsDto) {
    return this.transactionService.createDepositTransactions(body);
  }
}
