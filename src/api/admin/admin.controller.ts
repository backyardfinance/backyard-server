import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Keypair, PublicKey } from '@solana/web3.js';
import { CreateVaultDto, UsertInfoResponse, CreateUserDto } from 'src/dto';
import { MetaplexService } from 'src/services/metaplex/metaplex.service';
import { CreateMetadataParams } from 'src/services/metaplex/types';
import { SolanaService } from 'src/services/solana/solana.service';
import { DatabaseService } from '../../database';
import { UserService } from '../../services/user/user.service';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly solanaService: SolanaService,
    private readonly metaplexService: MetaplexService,
    private readonly db: DatabaseService,
    private readonly userService: UserService,
  ) {}

  @Get('/users')
  @ApiOkResponse({ type: UsertInfoResponse, isArray: true })
  async getUserTokens() {
    const users = await this.db.user.findMany();
    return users.map((user) => ({
      userId: user.id,
      name: user.name,
      wallet: user.wallet,
    }));
  }

  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

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
