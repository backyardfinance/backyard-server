import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @InjectPinoLogger(PrismaService.name)
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  async onModuleInit() {
    this.logger.info('Prisma service initialized');
    await this.$connect();
  }
}
