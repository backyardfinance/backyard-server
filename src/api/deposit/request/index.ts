import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateDepositRequest {
  @IsNumber()
  @IsNotEmpty()
  protocolIndex: number;

  @IsString()
  @IsNotEmpty()
  vaultId: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  signer: string;

  @IsString()
  @IsNotEmpty()
  inputToken: string;

  @IsString()
  @IsNotEmpty()
  lpMint: string;
}
