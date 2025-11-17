import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectPinoLogger('HTTP')
    private readonly logger: PinoLogger,
  ) {}

  // Routes to exclude from logging
  private readonly excludedRoutes = [
    '/',
    '/api/docs',
    '/whitelist/participants',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body } = request;

    // Skip logging for excluded routes
    if (this.shouldExcludeRoute(url)) {
      return next.handle();
    }

    // Extract user context from JWT payload if available
    const user = request['user'] as
      | { walletAddress?: string; userId?: string }
      | undefined;

    const startTime = Date.now();

    // Log incoming request
    this.logger.info(
      {
        direction: 'incoming',
        method,
        url,
        user: user
          ? {
              walletAddress: user.walletAddress,
              userId: user.userId,
            }
          : undefined,
        body: this.sanitizeData(body),
        requestId: request.id || request.headers['x-request-id'],
      },
      `→ [${method}] ${url}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log successful response
          this.logger.info(
            {
              direction: 'outgoing',
              method,
              url,
              statusCode,
              duration,
              user: user
                ? {
                    walletAddress: user.walletAddress,
                    userId: user.userId,
                  }
                : undefined,
              requestId: request.id || request.headers['x-request-id'],
            },
            `← [${method}] ${url} → ${statusCode} (${duration}ms)`,
          );
        },
        error: (error: any) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log error response
          this.logger.error(
            {
              direction: 'outgoing',
              method,
              url,
              statusCode,
              duration,
              user: user
                ? {
                    walletAddress: user.walletAddress,
                    userId: user.userId,
                  }
                : undefined,
              error: {
                message: error.message,
                name: error.name,
              },
              requestId: request.id || request.headers['x-request-id'],
            },
            `← [${method}] ${url} → ${statusCode} (${duration}ms)`,
          );
        },
      }),
    );
  }

  /**
   * Check if the route should be excluded from logging
   */
  private shouldExcludeRoute(url: string): boolean {
    return this.excludedRoutes.some((route) => {
      if (route === '/') {
        return url === '/';
      }
      return url.startsWith(route);
    });
  }

  /**
   * Sanitize data to remove sensitive fields
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'privateKey',
      'secret',
      'token',
      'authorization',
      'cookie',
    ];

    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const key in sanitized) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (
        typeof sanitized[key] === 'object' &&
        sanitized[key] !== null
      ) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }
}
