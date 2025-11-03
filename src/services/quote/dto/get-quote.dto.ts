import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuoteType } from './quote-type.enum';

export class VaultDepositDto {
  @ApiProperty({
    required: true,
    example: '4beb141c-0af8-42f4-b3df-99ddc55a5960',
  })
  @IsString()
  @IsNotEmpty()
  vaultId: string;

  @ApiProperty({ required: true, example: '100000000' })
  @IsString()
  @IsNotEmpty()
  amount: string;
}

export class GetQuoteDto {
  @ApiProperty({
    required: true,
    example: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({ required: true, enum: QuoteType })
  @IsNotEmpty()
  type: QuoteType;

  @ApiProperty({ required: true, type: [VaultDepositDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VaultDepositDto)
  deposits: VaultDepositDto[];
}
