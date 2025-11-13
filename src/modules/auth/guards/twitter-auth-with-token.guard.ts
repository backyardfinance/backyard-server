import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { TwitterAuthGuard } from './twitter-auth.guard';

@Injectable()
export class TwitterAuthWithTokenGuard extends TwitterAuthGuard {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = request.query.token as string;

    // Set cookie before OAuth redirect
    if (token) {
      response.cookie('oauth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
    }

    // Call parent guard to initiate OAuth flow
    return super.canActivate(context);
  }
}
