import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VaultDepositDto {
  @IsString()
  @IsNotEmpty()
  vaultId: string;

  @IsString()
  @IsNotEmpty()
  amount: string;
}

export class GetQuoteDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VaultDepositDto)
  deposits: VaultDepositDto[];
}
