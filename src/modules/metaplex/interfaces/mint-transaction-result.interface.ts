import { ApiProperty } from '@nestjs/swagger';

export class MintTransactionResult {
  @ApiProperty()
  transaction: string;
}
