import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDepositTransactionsDto } from 'src/services/transaction/dto/create-deposit-transactions.dto';
import { TransactionService } from 'src/services/transaction/transaction.service';

@Controller('transactions')
@ApiTags('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('create-deposits')
  async createDepositTransactions(@Body() body: CreateDepositTransactionsDto) {
    return this.transactionService.createDepositTransactions(body);
  }
}
