import { Module, DynamicModule } from '@nestjs/common';
import { CreateQueueOptions, QueueService } from './queue.service';

@Module({})
export class QueueModule {
  static forRoot(options?: CreateQueueOptions): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        {
          provide: 'CREATE_QUEUE_OPTIONS',
          useValue: options,
        },
        QueueService,
      ],
      exports: [QueueService],
    };
  }
}
