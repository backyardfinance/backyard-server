import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserXDto } from '../../dto';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import bs58 from 'bs58';
import { sign } from 'tweetnacl';
import { UserService } from '../user/user.service';
import { AuthResult } from './interfaces/auth.interface';
import { TokenPayload } from './interfaces/token-payload.interface';
import { ClaimNonceDto } from './dto/claim-nonce.dto';
import { ClaimNonceResponseDto } from './dto/claim-nonce-response.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { TestLoginDto } from './dto/test-login.dto';

@Injectable()
export class AuthService {
  private clientId: string;
  private redirectUri: string;
  // TODO: NOT FOR PROD
  private cache: Record<string, string> = {};

  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.config.get<string>('twitter.client_id');
    this.redirectUri = this.config.get<string>('twitter.redirect_uri');
  }

  async claimNonce(dto: ClaimNonceDto): Promise<ClaimNonceResponseDto> {
    const { wallet } = dto;
    const nonce = this.generateNonce(wallet);
    return {
      wallet,
      nonce,
    };
  }

  async verifySignature(dto: VerifySignatureDto): Promise<AuthResult> {
    const { wallet, signature } = dto;
    const nonce = this.cache[wallet];
    if (!nonce) throw new BadRequestException(`Nonce not found`);

    const validatedWallet = this.validateSignature(wallet, signature, nonce);
    if (!validatedWallet)
      throw new BadRequestException(`Invalid signature detected`);

    const user = await this.userService.findOrCreate({ wallet });
    const userId = user.id;

    const accessToken = this.generateAccessToken({
      userId,
      wallet,
    });
    const refreshToken = this.generateRefreshToken({
      userId,
      wallet,
    });

    return {
      user: {
        userId,
        wallet,
      },
      accessToken,
      refreshToken,
    };
  }

  // TEST ONLY: Create user and login without signature verification
  // TODO: Remove this endpoint before deploying to production
  async testLogin(dto: TestLoginDto): Promise<AuthResult> {
    const { wallet } = dto;

    // Find or create user with WhitelistParticipant
    const user = await this.userService.findOrCreate({ wallet });
    const userId = user.id;

    // Generate tokens without signature verification
    const accessToken = this.generateAccessToken({
      userId,
      wallet,
    });
    const refreshToken = this.generateRefreshToken({
      userId,
      wallet,
    });

    return {
      user: {
        userId,
        wallet,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload)
      throw new UnauthorizedException('Invalid or expired refresh token');

    const wallet = payload.wallet;

    const user = await this.userService.findByWallet(wallet);
    if (!user) throw new UnauthorizedException('User not found');

    const userId = user.id;
    const newPayload: TokenPayload = {
      userId,
      wallet,
    };

    const accessToken = this.generateAccessToken(newPayload);
    const newRefreshToken = this.generateRefreshToken(newPayload);

    return {
      user: {
        userId,
        wallet,
      },
      accessToken: accessToken,
      refreshToken: newRefreshToken,
    };
  }

  // 1️⃣ Create authorization URL
  getAuthUrl() {
    const baseUrl = 'https://twitter.com/i/oauth2/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'users.read tweet.read offline.access',
      state: 'random_state_123',
      code_challenge: 'challenge',
      code_challenge_method: 'plain',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async linkTwitterAccount(
    userId: string,
    twitterData: { xId: string; xUsername: string },
  ) {
    const { xId, xUsername } = twitterData;

    // Update user with Twitter information
    const updatedUser = await this.userService.linkTwitterToUser(
      userId,
      xId,
      xUsername,
    );

    return {
      xId: updatedUser.xId,
      xUserName: updatedUser.xUsername,
    } as UserXDto;
  }

  private generateNonce(wallet: string): string {
    const existingNonce = this.cache[wallet];
    if (existingNonce) return existingNonce;

    const phrases = [
      'grill-some-veggies',
      'bake-a-sunny-pie',
      'brew-sweet-lemonade',
      'plant-some-basil',
      'chill-under-the-tree',
      'paint-the-fence-blue',
      'toast-marshmallows',
      'water-the-lilies',
      'mow-the-green-lawn',
      'hang-string-lights',
    ];

    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const randomSuffix = randomBytes(16).toString('hex');

    const nonce = `backyard:${randomPhrase}:${randomSuffix}`;

    this.cache[wallet] = nonce;
    return nonce;
  }

  private validateSignature(wallet: string, signature: string, nonce: string) {
    const publicKeyUint8 = bs58.decode(wallet);
    const signatureUint8 = bs58.decode(signature);
    const msgUint8 = new TextEncoder().encode(nonce);

    const isValid = sign.detached.verify(
      msgUint8,
      signatureUint8,
      publicKeyUint8,
    );
    if (!isValid) throw new BadRequestException(`Invalid signature`);

    return wallet;
  }

  private generateAccessToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(payload: TokenPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      return null;
    }
  }

  private verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      return null;
    }
  }
}
