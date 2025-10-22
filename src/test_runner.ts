import { INestApplication } from '@nestjs/common';
import { JupiterApiService } from './services/jupiter-api/jupiter-api.service';

export const testMain = async (app: INestApplication) => {
  const jupiterApiService = app.get(JupiterApiService);

  await jupiterApiService.snapshotVaultsAndUpdateCurrent();
};
