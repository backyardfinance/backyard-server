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
import { AuthResult } from './interfaces/auth.interface';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.verifySignature(dto);
    const { user, accessToken, refreshToken } = result;

    //TODO: ref
    response.cookie('accessToken', accessToken, {
      // httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refreshToken', refreshToken, {
      // httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  // TEST ONLY: Login without wallet signature verification
  // TODO: Remove this endpoint before deploying to production
  @Post('test-login')
  async testLogin(
    @Body() dto: TestLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResult> {
    const result = await this.authService.testLogin(dto);
    const { accessToken, refreshToken } = result;

    //TODO: ref
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthResponseDto })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = request.cookies['refreshToken'];
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');

    const result = await this.authService.refreshTokens(refreshToken);
    const { user, accessToken, refreshToken: newRefreshToken } = result;

    //TODO: ref
    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  @Get('/x/login')
  @UseGuards(TwitterAuthGuard)
  async login() {
    // Guard handles JWT verification and state parameter
    // Passport will handle the redirect to Twitter
  }

  @Get('/x/callback')
  @UseGuards(TwitterAuthGuard)
  async callback(
    @Req() req: Request & { user: any },
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('frontend_url');

    try {
      const accessToken = req.cookies?.['accessToken'];

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

      // Redirect to frontend on success
      res.redirect(frontendUrl);
    } catch (error) {
      // Redirect to frontend with error parameter
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      res.redirect(`${frontendUrl}?error=${encodeURIComponent(errorMessage)}`);
    }
  }
}
