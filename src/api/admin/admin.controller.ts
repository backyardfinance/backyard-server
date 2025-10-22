import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateVaultDto } from 'src/dto';
import { MetaplexService } from 'src/services/metaplex/metaplex.service';
import { CreateMetadataParams } from 'src/services/metaplex/types';
import { SolanaService } from 'src/services/solana/solana.service';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly metaplexService: MetaplexService,
  ) {}

  @Post('create-vault')
  async createVault(@Body() dto: CreateVaultDto) {
    const vaultResult = await this.solanaService.createVault(dto.platform);

    const lpResult = await this.solanaService.createLP(
      vaultResult.vaultPdaAddress,
    );

    const params: CreateMetadataParams = {
      mint: lpResult.mint,
      name: dto.lpName,
      symbol: dto.symbol,
      uri: dto.uri,
    };
    const metaResult = await this.metaplexService.uploadToken2022Meta(params);

    return {
      vaultResult,
      lpResult,
      metaResult,
    };
  }
}
