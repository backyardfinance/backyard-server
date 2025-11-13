import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SolanaService } from '../solana/solana.service';
import { MetaplexService } from '../metaplex/metaplex.service';
import { UserService } from '../user/user.service';
import { MetaplexCNftService } from '../metaplex/metaplex-cnft';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly metaplexService: MetaplexService,
    private readonly userService: UserService,
    private readonly metaplexCNftService: MetaplexCNftService,
  ) {}

  // @Post('initialize-whitelist')
  // async initializeWhitelist() {
  //   await this.metaplexCNftService.createSoulboundCollection();
  //   await this.metaplexCNftService.createTree();
  // }

  /*@Post('create-vault')
  async createVault(@Body() dto: CreateVaultDto) {
    const ourLpMint = Keypair.generate();
    const { platform, platfromLp, platformVaultInputToken } = dto;
    const vaultResult = await this.solanaService.createVault(
      platform,
      ourLpMint.publicKey.toString(),
      platfromLp,
      platformVaultInputToken,
    );

    const lpResult = await this.solanaService.createLPAndAtas(
      vaultResult.vaultPdaAddress,
      new PublicKey(dto.platformVaultInputToken),
      new PublicKey(dto.platfromLp),
      ourLpMint,
    );

    const { lpName, lpSymbol, uri } = dto;
    const params: CreateMetadataParams = {
      mint: lpResult.mint,
      lpName,
      lpSymbol,
      uri,
    };
    const metaResult = await this.metaplexService.uploadToken2022Meta(params);

    return {
      vaultResult,
      lpResult,
      metaResult,
    };
  }*/
}
