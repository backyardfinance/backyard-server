import { ConfigModule as NestConfigModule } from '@nestjs/config';

export const ConfigModule = (configuration: any) =>
  NestConfigModule.forRoot({ isGlobal: true, load: [configuration] });

export { ConfigService } from '@nestjs/config';
