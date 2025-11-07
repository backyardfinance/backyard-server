import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  UserVaultHistoryInfoResponse,
  VaultHistoryInfoResponse,
  VaultInfoResponse,
  VaultInfoStrategyResponse,
} from '../../dto';
import { WalletToUserPipe } from '../../common/pipes/wallet-to-user-pipe';
import { VaultService } from './vault.service';

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
  async getVaultHistoryByVaultId(@Param('vaultId') vaultId: string) {
    return this.vaultService.getVaultHistoryByVaultId(vaultId);
  }

  @Get('/history/:walletAddress/:vaultId')
  @ApiOkResponse({ type: UserVaultHistoryInfoResponse, isArray: true })
  async getVaultHistory(
    @Param('walletAddress', WalletToUserPipe) userId: string,
    @Param('vaultId') vaultId: string,
  ) {
    return this.vaultService.getVaultHistory(vaultId, userId);
  }

  @Get('/:walletAddress/:vaultId')
  @ApiOkResponse({ type: VaultInfoStrategyResponse })
  async getVault(
    @Param('walletAddress', WalletToUserPipe) userId: string,
    @Param('vaultId') vaultId: string,
  ) {
    return this.vaultService.getVaultUserInfo(vaultId, userId);
  }
}
