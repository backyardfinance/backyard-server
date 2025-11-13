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
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MetaplexCNftService } from '../metaplex/metaplex-cnft';
import { publicKey } from '@metaplex-foundation/umi';

@ApiTags('Users')
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
  public async sendEmail(
    @Body() body: SendEmailDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const userId = req.user.userId;
    return this.userService.sendEmail(userId, body);
  }

  @Post('verify-email-code')
  @UseGuards(JwtAuthGuard)
  async verify(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request & { user: { userId: string } },
  ) {
    const userId = req.user.userId;
    return this.userService.verifyEmail(userId, dto);
  }

  @Post('check-follow')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: FollowStatusResponse })
  async checkFollow(@Req() req: Request & { user: { userId: string } }) {
    const userId = req.user.userId;
    return await this.userService.checkUserFollow(userId);
  }

  @Post('check-retweet')
  @UseGuards(JwtAuthGuard)
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

  @Post('prepare-mint')
  @UseGuards(JwtAuthGuard)
  async prepareMintTransaction(
    @Req() req: Request & { user: { wallet: string } },
  ) {
    const wallet = req.user.wallet;
    return this.metaplexCNftService.prepareMintTransaction(publicKey(wallet));
  }
}
