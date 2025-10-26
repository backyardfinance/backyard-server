import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VaultPlatform {
  Jupiter = 'Jupiter',
  Kamino = 'Kamino',
}

export class CreateVaultDto {
  @IsEnum(VaultPlatform)
  @ApiProperty({ enum: VaultPlatform, example: VaultPlatform.Jupiter })
  platform: VaultPlatform;

  @IsString()
  @ApiProperty()
  lpName: string;

  @IsString()
  @ApiProperty()
  symbol: string;

  @IsString()
  @ApiProperty()
  uri: string;
}

export class CreateStrategyDto {
  @IsString()
  @ApiProperty()
  name: string;
  @IsString()
  @ApiProperty()
  userId!: string;
  @IsObject()
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'number',
      example: 100,
    },
    example: {
      vault_1: 500,
      vault_2: 1200,
    },
    description: 'Record of vaultId -> deposited amount',
  })
  vaultDeposits: Record<string, number>;
}

export class QuoteDepositDto {
  @IsString()
  @ApiProperty()
  signer!: string; // base58 pubkey (frontend wallet)

  @IsString()
  @ApiProperty()
  vaultId!: string; // base58 pubkey

  @IsString()
  @ApiProperty()
  inputMint!: string; // base58 spl-token mint (TOKEN_PROGRAM_ID)

  @IsString()
  @ApiProperty()
  lpMint!: string; // base58 token-2022 mint with authority=vault PDA

  @IsNumberString()
  @ApiProperty()
  amount!: string; // integer in smallest units

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  ensureAtas?: boolean; // default true
}

export interface UserTokenView {
  mint: string;
  isNative: boolean;
  decimals: number;
  amountUi: number;
  name?: string;
  symbol?: string;
  logoURI?: string;
  priceUsd?: number;
  valueUsd?: number;
}

export interface UserPortfolioView {
  tokens: UserTokenView[];
  totalValueUsd: number;
}

export interface TokenInfoResponse {
  address: string;
  isNative: boolean;
  name: string;
  symbol: string;
  priceUsd?: number;
  logoURI?: string;
  valueUsd?: number;
  tokenAmount: TokenAmount;
}

export interface TokenAmount {
  amount: number;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

export class VaultInfo {
  @IsNumber()
  @ApiProperty()
  apy: number;
  @IsNumber()
  @ApiProperty()
  assetPrice: number;
  @IsNumber()
  @ApiProperty()
  tvl: number;
  @IsNumber()
  @ApiProperty()
  yardReward: number;
}

export class VaultInfoResponse extends VaultInfo {
  @IsString()
  @ApiProperty()
  id: string;
  @IsString()
  @ApiProperty()
  name: string;
  @IsString()
  @ApiProperty()
  platform: string;
}

export class VaultHistoryInfoResponse extends VaultInfo {
  @IsDate()
  @ApiProperty()
  recordedAt: Date;
}

export class UserStrategyInfoResponse {
  @IsString()
  @ApiProperty()
  strategyId: string;
  @IsString()
  @ApiProperty()
  strategyName: string;
  @IsNumber()
  @ApiProperty()
  depositedAmount: number;
  @IsNumber()
  @ApiProperty()
  interestEarned: number;
  @IsNumber()
  @ApiProperty()
  vaultWeight: number;
}

export class VaultInfoStrategyResponse extends VaultInfoResponse {
  @ApiProperty({
    type: [UserStrategyInfoResponse],
    description: 'List of user strategies connected to this vault',
  })
  strategies: UserStrategyInfoResponse[];
}

export class StrategyVaultInfo {
  @IsString()
  @ApiProperty()
  id: string;
  @IsString()
  @ApiProperty()
  name: string;
  @IsString()
  @ApiProperty()
  platform: string;
  @IsNumber()
  @ApiProperty()
  tvl: number;
  @IsNumber()
  @ApiProperty()
  apy: number;
  @IsNumber()
  @ApiProperty()
  depositedAmount: number;
}

export class StrategyInfoResponse {
  @IsString()
  @ApiProperty()
  strategyName: string;
  @IsString()
  @ApiProperty()
  strategyId: string;
  @IsNumber()
  @ApiProperty()
  strategyApy: number;
  @IsNumber()
  @ApiProperty()
  strategyDepositedAmount: number;
  @IsNumber()
  @ApiProperty()
  strategyTvl: number;
  @ApiProperty({
    type: [StrategyVaultInfo],
    description: 'List of vaults that is used in this strategy',
  })
  vaults: StrategyVaultInfo[];
}
