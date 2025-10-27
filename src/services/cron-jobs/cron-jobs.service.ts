import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KaminoApiService } from '../kamino-service/kamino-api.service';
import { JupiterApiService } from '../jupiter-api/jupiter-api.service';

@Injectable()
export class CronJobsService {
  constructor(
    private readonly kaminoService: KaminoApiService,
    private readonly jupiterApiService: JupiterApiService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async update1() {
    // await this.categoriesService.parseCategoriesToDataBase();
  }

  @Cron(CronExpression.EVERY_HOUR)
  public async updateEveryHour() {
    await this.kaminoService.upsertVaultsFromApi();
    await this.jupiterApiService.upsertVaultsFromApi();
  }
}
