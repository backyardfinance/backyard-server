import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ExceptionFilter.name);

  constructor(protected readonly httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
  }

  public catch(exception: any, host: ArgumentsHost) {
    const applicationRef =
      this.applicationRef ||
      (this.httpAdapterHost && this.httpAdapterHost.httpAdapter);

    const exceptionMessage = exception.toString();

    if (exceptionMessage.includes('invalid input syntax for type')) {
      exception = new HttpException(exception.message, HttpStatus.BAD_REQUEST);
    } else if (
      exceptionMessage.includes(
        'duplicate key value violates unique constraint',
      )
    ) {
      this.logger.error(exception.message, exception.stack);
      exception = new HttpException(
        'Resource already exists in the database',
        HttpStatus.CONFLICT,
      );
    }

    if (
      !(exception instanceof HttpException) &&
      exception.getResponse == null &&
      exception.getStatus == null
    ) {
      return this.handleUnknownError(exception, host, applicationRef);
    }

    const res = exception.getResponse();

    const message =
      res !== null && typeof res === 'object'
        ? res
        : {
            statusCode: exception.getStatus(),
            message: res,
          };

    applicationRef.reply(host.getArgByIndex(1), message, exception.getStatus());
  }
}
