import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class GetQuoteDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  vaultIds: string[];
}
