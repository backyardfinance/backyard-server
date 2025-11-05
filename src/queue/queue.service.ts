import { Inject, Injectable, Optional } from '@nestjs/common';
import PQueue, { Options } from 'p-queue';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateQueueOptions extends Options<any, any> {}

@Injectable()
export class QueueService {
  private queue: PQueue;

  constructor(
    @Optional() @Inject('CREATE_QUEUE_OPTIONS') options?: CreateQueueOptions,
  ) {
    this.queue = new PQueue(options);
  }

  public async enqueue(fn: (...args: any[]) => Promise<any> | any) {
    return this.queue.add(fn);
  }
}
