import { Controller, Get, Query, Res } from '@nestjs/common';

import { Response } from 'express';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserXDto } from '../../dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
