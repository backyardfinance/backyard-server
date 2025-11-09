import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserXDto } from '../../dto';
import { AuthService } from './auth.service';
import { ClaimNonceResponseDto } from './dto/claim-nonce-response.dto';
import { ClaimNonceDto } from './dto/claim-nonce.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
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
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  @Get('/x/login')
  async login(@Res() res: Response) {
    const url = this.authService.getAuthUrl();
    return res.redirect(url);
  }

  @Get('/x/callback')
  @ApiOkResponse({ type: UserXDto })
  async callback(@Query('code') code: string, @Res() res: Response) {
    const user = await this.authService.handleCallback(code);
    return res.json(user);
  }
}
