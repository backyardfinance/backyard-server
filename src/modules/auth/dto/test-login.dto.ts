import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TestLoginDto {
  @ApiProperty({
    type: String,
    description: 'Solana wallet address for testing',
  })
  @IsString()
  @IsNotEmpty()
  wallet: string;
}
