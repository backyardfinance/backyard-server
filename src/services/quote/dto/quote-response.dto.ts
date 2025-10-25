import { VaultPlatform } from '@prisma/client';

export class QuoteVaultDto {
  vaultId: string;
  platform: VaultPlatform;
  amount: string;
  accounts: any;
}

export class QuoteResponseDto {
  signer: string;
  vaults: QuoteVaultDto[];
}
