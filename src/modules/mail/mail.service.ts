import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  SendTemplateMailOptions,
  EmailTemplate,
  SendVerifyCodeEmailOptions,
} from './types';
import { MailSendingFailureError } from 'src/common/error';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly l = new Logger(MailService.name);
  private resend: Resend;
  private templateIdMap: Map<EmailTemplate, string>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('resend.api_key');
    if (!apiKey) {
      this.l.warn('Resend API key not configured');
      return;
    }

    this.resend = new Resend(apiKey);

    this.templateIdMap = new Map([
      [
        EmailTemplate.VerifyCode,
        this.configService.get<string>('resend.verify_code_template_id'),
      ],
    ]);

    this.l.log('Resend Mail Service initialized');
  }

  private async sendMailFromTemplate(
    options: SendTemplateMailOptions,
  ): Promise<any> {
    const context = { ...options.data };
    delete options.data;

    return await this.mailSend(options, context);
  }

  private async mailSend(options: SendTemplateMailOptions, context: any) {
    try {
      const templateId = this.templateIdMap.get(options.template);

      if (!templateId) {
        throw new Error(
          `Template ID not found for template: ${options.template}`,
        );
      }

      const fromEmail = this.configService.get<string>('resend.from_email');
      const fromName = this.configService.get<string>('resend.from_name');

      const response = await this.resend.emails.send({
        from: fromEmail ? `${fromName} <${fromEmail}>` : undefined,
        to: options.to,
        subject: options.subject,
        template: {
          id: templateId,
          variables: context,
        },
      });

      this.l.log(`Email sent successfully to ${options.to}`);
      return response;
    } catch (error) {
      this.l.error(`Failed to send email: ${error.message}`, error.stack);
      if (options.throwErrorOnFail) {
        throw new MailSendingFailureError('Error occurred while sending email');
      }
    }
  }

  public async sendVerifyCodeEmail(options: SendVerifyCodeEmailOptions) {
    const mailOptions: SendTemplateMailOptions = {
      ...options,
      template: EmailTemplate.VerifyCode,
    };
    await this.sendMailFromTemplate(mailOptions);
  }
}
