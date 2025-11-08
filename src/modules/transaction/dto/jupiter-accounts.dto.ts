import { IsNotEmpty, IsString } from 'class-validator';

export class JupiterAccountsDto {
  @IsString()
  @IsNotEmpty()
  inputToken: string;

  @IsString()
  @IsNotEmpty()
  lpToken: string;

  @IsString()
  @IsNotEmpty()
  fTokenMint: string;

  @IsString()
  @IsNotEmpty()
  jupiterVault: string;

  @IsString()
  @IsNotEmpty()
  lending: string;

  @IsString()
  @IsNotEmpty()
  lendingAdmin: string;

  @IsString()
  @IsNotEmpty()
  rewardsRateModel: string;

  @IsString()
  @IsNotEmpty()
  lendingSupplyPositionOnLiquidity: string;

  @IsString()
  @IsNotEmpty()
  liquidity: string;

  @IsString()
  @IsNotEmpty()
  liquidityProgram: string;

  @IsString()
  @IsNotEmpty()
  rateModel: string;

  @IsString()
  @IsNotEmpty()
  supplyTokenReservesLiquidity: string;
}
