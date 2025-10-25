import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { VaultPlatform } from '@prisma/client';
import { Type } from 'class-transformer';
import { JupiterAccountsDto } from './jupiter-accounts.dto';

export class QuoteVaultDataDto {
  @IsString()
  @IsNotEmpty()
  vaultId: string;

  @IsEnum(VaultPlatform)
  platform: VaultPlatform;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @ValidateNested()
  @Type(() => Object, {
    discriminator: {
      property: 'platform',
      subTypes: [{ value: JupiterAccountsDto, name: VaultPlatform.Jupiter }],
    },
    keepDiscriminatorProperty: true,
  })
  accounts: JupiterAccountsDto;
}
