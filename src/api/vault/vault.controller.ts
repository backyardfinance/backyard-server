import { Controller, Get, Param } from '@nestjs/common';
import { VaultService } from '../../services/vault/vault.service';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  VaultHistoryInfoResponse,
  VaultInfoResponse,
  VaultInfoStrategyResponse,
} from '../../dto';

@Controller('vaults')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('/vaults')
  @ApiOkResponse({ type: VaultInfoResponse, isArray: true })
  async getAllVaults() {
    return this.vaultService.getVaults();
  }

  @Get('/history/:vaultId')
  @ApiOkResponse({ type: VaultHistoryInfoResponse, isArray: true })
  async getVaultHistory(@Param('vaultId') vaultId: string) {
    return this.vaultService.getVaultHistory(vaultId);
  }

  @Get('/:userId/:vaultId')
  @ApiOkResponse({ type: VaultInfoStrategyResponse })
  async getVault(
    @Param('userId') userId: string,
    @Param('vaultId') vaultId: string,
  ) {
    return this.vaultService.getVaultUserInfo(vaultId, userId);
  }
}
