import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KaminoApiService } from '../kamino/kamino-api.service';
import { JupiterApiService } from '../jupiter/jupiter-api.service';

@Injectable()
export class CronService {
  constructor(
    private readonly kaminoService: KaminoApiService,
    private readonly jupiterService: JupiterApiService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async update1() {}

  @Cron(CronExpression.EVERY_HOUR)
  public async updateEveryHour() {
    console.log('Start Cron job.');
    await this.kaminoService.upsertVaultsFromApi();
    await this.jupiterService.upsertVaultsFromApi();
    console.log('Finish Cron job.');
  }
}
