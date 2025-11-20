import { ApiProperty } from '@nestjs/swagger';
import { VaultPlatform } from '@prisma/client';

export class CreateDepositTransactionsResponseDto {
  @ApiProperty()
  serializedTransaction: string;

  @ApiProperty()
  blockhash: string;

  @ApiProperty()
  lastValidBlockHeight: number;

  @ApiProperty()
  vaultId: string;

  @ApiProperty({ enum: VaultPlatform })
  platform: VaultPlatform;
}
