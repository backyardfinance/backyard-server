export enum EmailTemplate {
  VerifyCode = 'verify-code',
}

export interface SendTemplateMailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  data: any;
  throwErrorOnFail?: boolean;
}
