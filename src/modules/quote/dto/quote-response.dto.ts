import { ApiProperty } from '@nestjs/swagger';
import { VaultPlatform } from '@prisma/client';
import { IsArray } from 'class-validator';
import { QuoteType } from './quote-type.enum';

export class QuoteVaultDto {
  @ApiProperty()
  vaultId: string;

  @ApiProperty()
  vaultPubkey: string;

  @ApiProperty({
    enum: VaultPlatform,
  })
  platform: VaultPlatform;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  apy: string;
}

export class QuoteResponseDto {
  @ApiProperty()
  signer: string;

  @ApiProperty({ enum: QuoteType })
  type: QuoteType;

  @ApiProperty({
    type: QuoteVaultDto,
  })
  @IsArray()
  vaults: QuoteVaultDto[];
}
