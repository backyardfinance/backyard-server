import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import {
  CreateUserDto,
  FollowStatusResponse,
  RetweetStatusResponse,
  SendEmailDto,
  UpdateUserDto,
  UsertInfoResponse,
  VerifyEmailDto,
} from '../../dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MetaplexCNftService } from '../metaplex/metaplex-cnft';
import { publicKey } from '@metaplex-foundation/umi';
import { MintTransactionResult } from '../metaplex/interfaces/mint-transaction-result.interface';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly metaplexCNftService: MetaplexCNftService,
  ) {}

  // @Post('siwe/nonce')
  // async nonce(@Query('address') address: string) {
  //   return this.userService.createNonce(address || 'anonymous');
  // }
  //
  // @Post('siws/verify')
  // async verifySiws(@Body() dto: VerifySiwsDto) {
  //   return this.userService.verifySiws(dto);
  // }

  @Get()
  @ApiOkResponse({ type: UsertInfoResponse, isArray: true })
  async getUsers() {
    return await this.userService.getUsers();
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  @Post('send-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Throttle({ medium: { limit: 5, ttl: 600000 } })
  public async sendEmail(
    @Body() body: SendEmailDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const userId = req.user.userId;
    return this.userService.sendEmail(userId, body);
  }

  @Post('verify-email-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Throttle({ long: { limit: 20, ttl: 1800000 } })
  async verify(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const userId = req.user.userId;
    return this.userService.verifyEmail(userId, dto);
  }

  @Post('check-follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Throttle({ short: { limit: 5, ttl: 300000 } })
  @ApiOkResponse({ type: FollowStatusResponse })
  async checkFollow(@Req() req: Request & { user: { userId: string } }) {
    const userId = req.user.userId;
    return await this.userService.checkUserFollow(userId);
  }

  @Post('check-retweet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @Throttle({ short: { limit: 5, ttl: 300000 } })
  @ApiOkResponse({ type: RetweetStatusResponse })
  async checkRetweet(@Req() req: Request & { user: { userId: string } }) {
    const userId = req.user.userId;
    return await this.userService.checkUserRetweet(userId);
  }

  @Patch(':walletAddress')
  async updateUser(
    @Param('walletAddress') wallet: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUserByWallet(wallet, dto);
  }

  @Post('prepare-mint/:walletAddress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @SkipThrottle()
  @ApiOkResponse({ type: MintTransactionResult })
  async prepareMintTransaction(
    @Param('walletAddress') wallet: string, // @Req() req: Request & { user: { wallet: string } },
  ): Promise<MintTransactionResult> {
    // const wallet = req.user.wallet;
    return this.metaplexCNftService.prepareMintTransaction(publicKey(wallet));
  }

  @Get('check/:walletAddress')
  @ApiOkResponse({ type: Boolean })
  async checkUserHasNFT(
    @Param('walletAddress') wallet: string,
  ): Promise<boolean> {
    return this.metaplexCNftService.checkUserHasNFT(wallet);
  }
}
