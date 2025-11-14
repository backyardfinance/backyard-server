import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterAuthGuard extends AuthGuard('twitter') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = request.query.token as string;

    console.log('[TwitterAuthGuard] Path:', request.path);
    console.log(
      '[TwitterAuthGuard] Token from query:',
      token ? 'present' : 'missing',
    );
    console.log('[TwitterAuthGuard] Query params:', request.query);

    // Set cookie before OAuth redirect
    if (token) {
      response.cookie('oauth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
      console.log('[TwitterAuthGuard] Cookie set successfully');
    } else if (request.path === '/auth/x/login') {
      console.warn('[TwitterAuthGuard] No token provided in query parameters');
    }

    // Call parent guard to initiate OAuth flow
    try {
      const result = (await super.canActivate(context)) as boolean;
      console.log('[TwitterAuthGuard] Super canActivate result:', result);
      return result;
    } catch (error) {
      console.error('[TwitterAuthGuard] OAuth flow failed:', error);
      console.error('[TwitterAuthGuard] Error details:', error.message);
      console.error('[TwitterAuthGuard] Error stack:', error.stack);
      throw error;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('[TwitterAuthGuard] handleRequest called');
    console.log('[TwitterAuthGuard] Error:', err);
    console.log('[TwitterAuthGuard] User:', user);
    console.log('[TwitterAuthGuard] Info:', info);

    if (err || !user) {
      console.error('[TwitterAuthGuard] Authentication failed:', err || info);
      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'Twitter authentication failed',
        )
      );
    }

    return user;
  }
}
