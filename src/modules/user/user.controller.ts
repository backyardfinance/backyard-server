import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CheckFollowDto,
  CheckRetweetDto,
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

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  public async sendEmail(@Body() body: SendEmailDto) {
    return this.userService.sendEmail(body);
  }

  @Post('verify-email-code')
  async verify(@Body() dto: VerifyEmailDto) {
    return this.userService.verifyEmail(dto);
  }

  @Post('check-follow')
  @ApiOkResponse({ type: FollowStatusResponse })
  async checkFollow(@Body() dto: CheckFollowDto) {
    // refactor to use username of logged-in twitter account
    return await this.userService.checkUserFollow(dto.twitter_username);
  }

  @Post('check-retweet')
  @ApiOkResponse({ type: RetweetStatusResponse })
  async checkRetweet(@Body() dto: CheckRetweetDto) {
    // refactor to use username of logged-in twitter account
    return await this.userService.checkUserRetweet(dto.twitter_username);
  }

  @Patch(':walletAddress')
  async updateUser(
    @Param('walletAddress') wallet: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUserByWallet(wallet, dto);
  }
}
