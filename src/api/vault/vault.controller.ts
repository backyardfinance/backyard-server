import { Controller, Get, Param } from '@nestjs/common';
import { VaultService } from '../../services/vault/vault.service';

@Controller('vaults')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('/vaults')
  async getAllVaults() {
    return this.vaultService.getVaults();
  }

  @Get('/history/:vaultId')
  async getVaultHistory(@Param('vaultId') vaultId: string) {
    return this.vaultService.getVaultHistory(vaultId);
  }

  @Get('/:userId/:vaultId')
  async getVault(
    @Param('userId') userId: string,
    @Param('vaultId') vaultId: string,
  ) {
    return this.vaultService.getVaultUserInfo(userId, vaultId);
  }
}
