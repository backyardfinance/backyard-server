import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuoteVaultDataDto } from './quote-vault-data.dto';
import { QuoteType } from 'src/services/quote/dto/quote-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepositTransactionsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signer: string;

  @ApiProperty({ enum: QuoteType })
  @IsEnum(QuoteType)
  type: QuoteType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteVaultDataDto)
  @ApiProperty({ type: QuoteVaultDataDto })
  vaults: QuoteVaultDataDto[];
}
