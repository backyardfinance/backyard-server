import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterAuthGuard extends AuthGuard('twitter') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = request.query.token as string;

    console.log(
      '[TwitterAuthGuard] Token from query:',
      token ? 'present' : 'missing',
    );

    // Set cookie before OAuth redirect
    if (token) {
      response.cookie('oauth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
      console.log('[TwitterAuthGuard] Cookie set successfully');
    } else {
      console.warn('[TwitterAuthGuard] No token provided in query parameters');
    }

    // Call parent guard to initiate OAuth flow
    return super.canActivate(context);
  }
}
