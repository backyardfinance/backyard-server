import {
  IsBoolean,
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
  @ApiProperty()
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

export interface VaultInfo {
  apy: number;
  assetPrice: number;
  tvl: number;
  yardReward: number;
}

export interface VaultInfoResponse extends VaultInfo {
  id: string;
  name: string;
  platform: string;
}

export interface VaultHistoryInfoResponse extends VaultInfo {
  recordedAt: Date;
}

export interface VaultInfoStrategyResponse extends VaultInfoResponse {
  strategies: UserStrategyInfoResponse[];
}

export interface UserStrategyInfoResponse {
  strategyId: string;
}

export interface StrategyVaultInfo {
  id: string;
  name: string;
  platform: string;
  tvl: number;
  apy: number;
  depositedAmount: number;
}

export interface StrategyInfoResponse {
  strategyName: string;
  strategyId: string;
  strategyApy: number;
  strategyDepositedAmount: number;
  strategyTvl: number;
  vaults: StrategyVaultInfo[];
}
