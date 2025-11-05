import { HttpException, HttpStatus } from '@nestjs/common';

export class MailSendingFailureError extends HttpException {
  constructor(message = 'Mail sending failure error') {
    super(
      {
        statusCode: 500,
        message: message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
