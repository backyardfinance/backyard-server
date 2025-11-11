import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimNonceDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  //TODO: add pubkey validation
  wallet: string;
}
