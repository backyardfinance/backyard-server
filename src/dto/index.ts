import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVaultDto {
  @IsString()
  @ApiProperty()
  protocolName: string;

  @IsString()
  @ApiProperty()
  lpName: string;

  @IsString()
  @ApiProperty()
  symbol: string;

  @IsString()
  @ApiProperty()
  uri: string;
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
