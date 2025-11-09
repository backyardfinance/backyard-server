import { ApiProperty } from '@nestjs/swagger';

export class ClaimNonceResponseDto {
  @ApiProperty()
  wallet: string;
  @ApiProperty()
  nonce: string;
}
