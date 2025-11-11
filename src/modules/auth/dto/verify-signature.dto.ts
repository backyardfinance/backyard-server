import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySignatureDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  //TODO: add pubkey validation
  wallet: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
