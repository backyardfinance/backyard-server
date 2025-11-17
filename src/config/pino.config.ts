import { Params } from 'nestjs-pino';
import { Request } from 'express';

/**
 * Pino logger configuration with dual transports:
 * 1. Console: Pretty-printed for development readability
 * 2. Sentry: JSON format for structured error tracking
 */
export const pinoConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',

    // Custom serializers for request/response objects
    serializers: {
      req: (req: Request) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        // Add user context from JWT if available
        user: (req as any).user
          ? {
              id: (req as any).user.id,
              walletAddress: (req as any).user.walletAddress,
            }
          : undefined,
        // Exclude sensitive headers
        headers: sanitizeHeaders(req.headers),
      }),
      res: (res: any) => ({
        statusCode: res.statusCode,
      }),
      err: (err: Error) => ({
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
      }),
    },

    // Custom log formatting
    formatters: {
      level: (label: string) => ({ level: label }),
      bindings: (bindings: any) => ({
        pid: bindings.pid,
        hostname: bindings.hostname,
        node_env: process.env.NODE_ENV,
      }),
    },

    // Transport configuration for pretty console output
    // Note: Sentry integration is handled via Sentry.pinoIntegration() in instrument.ts
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: false,
        messageFormat: '{context} {msg}',
        errorLikeObjectKeys: ['err', 'error'],
        // Show all metadata for detailed logging
        errorProps: '*',
        // Include all fields in output
        hideObject: false,
        // Custom message key for better formatting
        messageKey: 'msg',
      },
    },

    // Auto-log all HTTP requests
    autoLogging: {
      ignore: (req: Request) => {
        const ignoredPaths = ['/', '/api/docs', '/api/docs-json'];
        return ignoredPaths.includes(req.url);
      },
    },

    // Custom request ID generator (or use existing from headers)
    genReqId: (req: Request) => {
      return (
        req.headers['x-request-id']?.toString() ||
        `req-${Date.now()}-${Math.random().toString(36).substring(7)}`
      );
    },

    // Custom success/error messages
    customSuccessMessage: (req: Request, res: any) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req: Request, res: any, err: Error) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },

    // Redact sensitive data
    redact: {
      paths: [
        'req'
      ],
      censor: '[REDACTED]',
    },
  },
};

/**
 * Sanitize HTTP headers by removing sensitive information
 */
function sanitizeHeaders(headers: any): any {
  const sanitized = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
  ];

  sensitiveHeaders.forEach((header) => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
}
