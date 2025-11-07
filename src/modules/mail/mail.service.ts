import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendTemplateMailOptions } from './types';
import { MailSendingFailureError } from 'src/common/error';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class MailService {
  private readonly l = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly queue: QueueService,
  ) {}

  private async sendMailFromTemplate(
    options: SendTemplateMailOptions,
    enqueue = true,
  ): Promise<any> {
    const context = { ...options.data };
    delete options.data;

    if (enqueue) {
      return this.queue.enqueue(async () => {
        return await this.mailSend(options, context);
      });
    }

    return await this.mailSend(options, context);
  }

  private async mailSend(options: SendTemplateMailOptions, context: any) {
    try {
      return await this.mailerService.sendMail({
        ...options,
        context,
      });
    } catch (error) {
      this.l.error(error);
      if (options.throwErrorOnFail) {
        throw new MailSendingFailureError('Error occurred while sending email');
      }
    }
  }

  public async sendVerifyCodeEmail(options: SendTemplateMailOptions) {
    await this.sendMailFromTemplate(options);
  }
}
