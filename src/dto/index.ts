import {
  IsBoolean,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminCreateVaultDto {
  @IsString()
  @ApiProperty()
  vaultId!: string; // base58 pubkey to use as vault id
  @IsString()
  @ApiProperty()
  vaultName: string;
}

export class CreateStrategyDto {
  @IsString()
  @ApiProperty()
  vaultId!: string;
  @IsNumber()
  @ApiProperty()
  deposited_amount: number;
  @IsString()
  @ApiProperty()
  userId!: string;
}

export class QuoteDepositDto {
  @IsString()
  @ApiProperty()
  signer!: string; // base58 pubkey (frontend wallet)

  @IsString()
  @ApiProperty()
  vaultId!: string; // base58 pubkey

  @IsString()
  @ApiProperty()
  inputMint!: string; // base58 spl-token mint (TOKEN_PROGRAM_ID)

  @IsString()
  @ApiProperty()
  lpMint!: string; // base58 token-2022 mint with authority=vault PDA

  @IsNumberString()
  @ApiProperty()
  amount!: string; // integer in smallest units

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  ensureAtas?: boolean; // default true
}

export interface UserTokenView {
  mint: string;
  isNative: boolean;
  decimals: number;
  amountUi: number;
  name?: string;
  symbol?: string;
  logoURI?: string;
  priceUsd?: number;
  valueUsd?: number;
}

export interface UserPortfolioView {
  tokens: UserTokenView[];
  totalValueUsd: number;
}
