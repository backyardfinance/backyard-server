import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  // Routes to exclude from logging
  private readonly excludedRoutes = ['/', '/api/docs'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, headers } = request;

    // Skip logging for excluded routes
    if (this.shouldExcludeRoute(url)) {
      return next.handle();
    }

    // Extract user context from JWT payload if available
    const user = request['user'] as
      | { walletAddress?: string; id?: string }
      | undefined;
    const userContext = user
      ? `User: ${user.walletAddress || user.id || 'unknown'}`
      : '';

    // Start time for duration calculation
    const startTime = Date.now();

    // Sanitize request body to avoid logging sensitive data
    const sanitizedBody = this.sanitizeData(body);

    // Log incoming request
    this.logger.log(
      `→ [${method}] ${url} - ${userContext}${
        Object.keys(sanitizedBody || {}).length > 0
          ? ` - Body: ${JSON.stringify(sanitizedBody)}`
          : ''
      }`,
    );

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          // Calculate request duration
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Sanitize response body
          const sanitizedResponse = this.sanitizeData(data);

          // Log response
          this.logger.log(
            `← [${method}] ${url} → ${statusCode} (${duration}ms)${
              sanitizedResponse && Object.keys(sanitizedResponse).length > 0
                ? ` - Response: ${this.formatResponse(sanitizedResponse)}`
                : ''
            }`,
          );
        },
        error: (error: any) => {
          // Calculate request duration even on error
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          // Log error response (error details will be handled by exception filter)
          this.logger.error(
            `← [${method}] ${url} → ${statusCode} (${duration}ms) - Error: ${error.message}`,
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
   * TODO: use Sentry
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
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Format response data for logging
   * Truncate large responses to avoid cluttering logs
   */
  private formatResponse(data: any): string {
    const jsonString = JSON.stringify(data);
    const maxLength = 500; // Maximum response length to log

    if (jsonString.length > maxLength) {
      return jsonString.substring(0, maxLength) + '... (truncated)';
    }

    return jsonString;
  }
}
