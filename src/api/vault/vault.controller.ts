import { Controller, Get, Param } from '@nestjs/common';
import { VaultService } from '../../services/vault/vault.service';

@Controller('vaults')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('/vaults')
  async getAllVaults() {
    return this.vaultService.getVaults();
  }

  @Get('/:vaultId')
  async getStrategies(@Param('vaultId') vaultId: string) {
    return this.vaultService.getVaultHistory(vaultId);
  }
}
