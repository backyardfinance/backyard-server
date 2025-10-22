import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronJobsService {
  constructor() {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async update1() {
    // await this.categoriesService.parseCategoriesToDataBase();
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async update2() {
    // await this.materialsService.parseMaterialsToDataBase();
  }
}
