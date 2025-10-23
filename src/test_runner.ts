import { INestApplication } from '@nestjs/common';
import { JupiterApiService } from './services/jupiter-api/jupiter-api.service';
import { KaminoApiService } from './services/kamino-service/kamino-api.service';

export const testMain = async (app: INestApplication) => {
  const jupiterApiService = app.get(JupiterApiService);
  const kaminoService = app.get(KaminoApiService);
  await kaminoService.upsertVaultsFromApi();
  await jupiterApiService.upsertVaultsFromApi();
};
