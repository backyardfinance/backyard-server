import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(Logger) private readonly logger: LoggerService) {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      this.logger.error(`prisma error: ${(err as any).message}`, err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
