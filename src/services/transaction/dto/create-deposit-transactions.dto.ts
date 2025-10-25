import { IsString, IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteVaultDataDto } from './quote-vault-data.dto';

export class CreateDepositTransactionsDto {
  @IsString()
  @IsNotEmpty()
  signer: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteVaultDataDto)
  vaults: QuoteVaultDataDto[];
}
