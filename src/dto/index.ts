import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  walletAddress?: string;
}

export class CreateStrategyDto {
  @IsString()
  @ApiProperty()
  name: string;
  @IsString()
  @ApiProperty()
  walletAddress!: string;
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

export class TokenAmount {
  @IsNumber()
  @ApiProperty()
  amount: number;
  @IsNumber()
  @ApiProperty()
  decimals: number;
  @IsNumber()
  @ApiProperty()
  uiAmount: number;
  @IsString()
  @ApiProperty()
  uiAmountString: string;
}

export class TokenInfoResponse {
  @IsString()
  @ApiProperty()
  address: string;
  @IsBoolean()
  @ApiProperty()
  isNative: boolean;
  @IsString()
  @ApiProperty()
  name: string;
  @IsString()
  @ApiProperty()
  symbol: string;
  @IsNumber()
  @ApiProperty()
  priceUsd?: number;
  @IsString()
  @ApiProperty()
  logoURI?: string;
  @IsNumber()
  @ApiProperty()
  valueUsd?: number;
  @ApiProperty({
    type: TokenAmount,
    description: 'Token amount',
  })
  tokenAmount: TokenAmount;
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
  @IsString()
  @ApiProperty()
  publicKey: string;
}
// TODO Rename
export class UsertInfoResponse {
  // @IsString()
  // @ApiProperty()
  // userId: string;
  @IsString()
  @ApiProperty()
  name: string;
  @IsString()
  @ApiProperty()
  wallet: string;
  @IsString()
  @ApiProperty()
  email: string;
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

export class VaultHistoryUserSlice {
  @IsNumber()
  @ApiProperty()
  positionUsd: number;

  @IsNumber()
  @ApiProperty()
  apy: number;
}

export class VaultHistoryInfoResponse extends VaultInfo {
  @IsDate()
  @ApiProperty()
  recordedAt: Date;
}

export class UserVaultHistoryInfoResponse extends VaultInfo {
  @IsDate()
  @ApiProperty()
  recordedAt: Date;

  @ApiProperty({ type: VaultHistoryUserSlice })
  user: VaultHistoryUserSlice;
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
    type: UserStrategyInfoResponse,
    isArray: true,
    description: 'List of user strategies connected to this vault',
  })
  strategies: UserStrategyInfoResponse[];

  @ApiProperty()
  @IsNumber()
  myPositionUsd: number;

  @ApiProperty()
  @IsNumber()
  myOwnershipFraction: number;
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
  strategyDepositedAmount: number;
  @IsNumber()
  @ApiProperty()
  strategyApy: number;
  @ApiProperty({
    type: StrategyVaultInfo,
    isArray: true,
    description: 'List of vaults that is used in this strategy',
  })
  vaults: StrategyVaultInfo[];
}

export class StrategyHistoryPoint {
  @IsDate()
  @ApiProperty()
  recordedAt: Date;

  @IsNumber()
  @ApiProperty()
  positionUsd: number;

  @IsNumber()
  @ApiProperty()
  apy: number;
}

export class PortfolioHistoryPoint {
  @IsDate()
  @ApiProperty()
  recordedAt: Date;

  @IsNumber()
  @ApiProperty()
  totalPositionUsd: number;

  @IsNumber()
  @ApiProperty()
  avgApy: number;
}

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  wallet: string;
}

export class VerifySiwsDto {
  @ApiProperty()
  @IsString()
  message!: string;
  @ApiProperty()
  @IsString()
  signature!: string;
  @ApiProperty()
  @IsString()
  address!: string;
}

export class SendEmailDto {
  @IsEmail()
  @ApiProperty()
  @Transform((email) => email.value.toLowerCase())
  email: string;
}

export class VerifyEmailDto {
  @IsString()
  @ApiProperty()
  code: string;
}

export class TwitterVerifyDto {
  @IsBoolean()
  @ApiProperty()
  subscribed: boolean;

  @IsBoolean()
  @ApiProperty()
  retweeted: boolean;
}

export class UserXDto {
  @IsString()
  @ApiProperty()
  xId: string;

  @IsString()
  @ApiProperty()
  xUserName: string;
}

export class CheckFollowDto {
  @IsString()
  @ApiProperty()
  twitter_username: string;
}

export class CheckRetweetDto {
  @IsString()
  @ApiProperty()
  twitter_username: string;
}

export class FollowStatusResponse {
  @IsBoolean()
  @ApiProperty()
  is_following: boolean;

  @IsString()
  @ApiProperty()
  checked_by: string;

  @IsString()
  @ApiProperty()
  checked_at: string;
}

export class RetweetStatusResponse {
  @IsBoolean()
  @ApiProperty()
  has_retweeted: boolean;

  @IsString()
  @ApiProperty()
  checked_by: string;

  @IsString()
  @ApiProperty()
  checked_at: string;
}

export class WhitelistTasksDto {
  @IsBoolean()
  @ApiProperty()
  wallet_connected: boolean;

  @IsBoolean()
  @ApiProperty()
  email_verified: boolean;

  @IsBoolean()
  @ApiProperty()
  twitter_linked: boolean;

  @IsBoolean()
  @ApiProperty()
  twitter_followed: boolean;

  @IsBoolean()
  @ApiProperty()
  post_retweeted: boolean;
}

export class WhitelistProgressDto {
  @IsNumber()
  @ApiProperty()
  completed: number;

  @IsNumber()
  @ApiProperty()
  total: number;

  @IsNumber()
  @ApiProperty()
  percentage: number;
}

export class WhitelistStatusDto {
  @IsString()
  @ApiProperty()
  userId: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  wallet?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  twitterUsername?: string;

  @IsObject()
  @ApiProperty({ type: WhitelistTasksDto })
  tasks: WhitelistTasksDto;

  @IsObject()
  @ApiProperty({ type: WhitelistProgressDto })
  progress: WhitelistProgressDto;

  @IsBoolean()
  @ApiProperty()
  isComplete: boolean;

  @IsDate()
  @ApiProperty()
  createdAt: Date;

  @IsDate()
  @ApiProperty()
  updatedAt: Date;
}

export class WhitelistParticipantDto {
  @IsNumber()
  @ApiProperty()
  count: number;
}
