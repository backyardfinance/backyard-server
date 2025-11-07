import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { VaultPlatform } from '@prisma/client';

export class QuoteVaultDataDto {
  @IsString()
  @IsNotEmpty()
  vaultId: string;

  @IsEnum(VaultPlatform)
  platform: VaultPlatform;

  @IsString()
  @IsNotEmpty()
  amount: string;
}
