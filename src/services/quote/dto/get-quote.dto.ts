import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VaultDepositDto {
  @ApiProperty({
    required: true,
    example: '6a7142ed-fbcb-43e9-9292-8c6df4631f6c',
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

  @ApiProperty({ required: true })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VaultDepositDto)
  deposits: VaultDepositDto[];
}
