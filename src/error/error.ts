import { HttpException, HttpStatus } from '@nestjs/common';

export class UnexpectedHttpException extends HttpException {
  constructor({
    name,
    description,
    error,
  }: {
    name: string;
    description: string;
    error: Error;
    [anyKey: string]: any;
  }) {
    super(
      {
        name,
        description,
        error,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
