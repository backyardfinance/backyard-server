import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

import { Request, Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ClaimNonceResponseDto } from './dto/claim-nonce-response.dto';
import { ClaimNonceDto } from './dto/claim-nonce.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TwitterAuthGuard } from './guards/twitter-auth.guard';
import { TestLoginDto } from './dto/test-login.dto';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @InjectPinoLogger(AuthController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Post('claim-nonce')
  @ApiOkResponse({ type: ClaimNonceResponseDto })
  async claimNonce(@Body() dto: ClaimNonceDto): Promise<ClaimNonceResponseDto> {
    return this.authService.claimNonce(dto);
  }

  @Post('verify-signature')
  @ApiOkResponse({ type: AuthResponseDto })
  async verifySignature(
    @Body() dto: VerifySignatureDto,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.verifySignature(dto);
    const { user, accessToken, refreshToken } = result;
    const userId = user.userId;
    const wallet = user.wallet;

    return {
      userId,
      wallet,
      accessToken,
      refreshToken,
    };
  }

  // TEST ONLY: Login without wallet signature verification
  // TODO: Remove this endpoint before deploying to production
  @Post('test-login')
  async testLogin(@Body() dto: TestLoginDto): Promise<AuthResponseDto> {
    const result = await this.authService.testLogin(dto);
    const { user, accessToken, refreshToken } = result;
    const userId = user.userId;
    const wallet = user.wallet;

    return {
      userId,
      wallet,
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthResponseDto })
  async refreshToken(@Req() request: Request): Promise<AuthResponseDto> {
    const authHeader = request.headers.authorization;
    if (!authHeader)
      throw new UnauthorizedException('No authorization header provided');

    const refreshToken = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    const result = await this.authService.refreshTokens(refreshToken);
    const { user, accessToken, refreshToken: newRefreshToken } = result;
    const userId = user.userId;
    const wallet = user.wallet;

    return {
      userId,
      wallet,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  @Get('/x/login')
  @UseGuards(TwitterAuthGuard)
  @Throttle({ short: { limit: 5, ttl: 300000 } })
  async login() {
    // Guard sets cookie and handles the redirect to Twitter
  }

  @Get('/x/callback')
  @UseGuards(TwitterAuthGuard)
  @SkipThrottle()
  async callback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('frontend_url');
    const twitterAuthRedirectUrl = this.configService.get<string>(
      'twitter.auth_redirect_url',
    );

    try {
      const accessToken = req.cookies?.['oauth_token'];

      if (!accessToken) {
        throw new UnauthorizedException(
          'User must be authenticated with wallet before linking Twitter',
        );
      }

      const jwtPayload = this.authService.verifyAccessToken(accessToken);
      if (!jwtPayload || !jwtPayload.userId) {
        throw new UnauthorizedException('Invalid access token');
      }
      // Get userId from OAuth state (extracted by TwitterStrategy)
      const userId = jwtPayload.userId;
      if (!userId) {
        throw new UnauthorizedException(
          'Invalid OAuth state. Please start the Twitter linking process again.',
        );
      }

      // Link Twitter account to user
      const twitterData = {
        xId: req.user.xId,
        xUsername: req.user.xUsername,
      };

      await this.authService.linkTwitterAccount(userId, twitterData);

      // Clear cookie after successful linking
      res.clearCookie('oauth_token');

      // Redirect to frontend on success
      res.redirect(`${frontendUrl}${twitterAuthRedirectUrl}`);
    } catch (error) {
      // Clear cookie on error
      res.clearCookie('oauth_token');

      // Redirect to frontend with error parameter
      this.logger.error('Error during Twitter callback:', error);
      let { message } = error;
      if (!message || message.includes('prisma')) {
        message = 'Something goes wrong. Please try again.';
      }
      res.redirect(
        `${frontendUrl}${twitterAuthRedirectUrl}?error=${encodeURIComponent(message)}`,
      );
    }
  }
}
