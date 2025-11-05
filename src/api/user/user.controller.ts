import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateUserDto,
  SendEmailDto,
  TwitterVerifyDto,
  UpdateUserDto,
  UsertInfoResponse,
  VerifyEmailDto,
} from '../../dto';
import { UserService } from '../../services/user/user.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

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

  @Post('validate-twitter')
  @ApiOkResponse({ type: TwitterVerifyDto })
  async validateUser(@Query('userId') userId: string) {
    return await this.userService.verifyUserTwitterActions(userId);
  }

  @Patch(':walletAddress')
  async updateUser(
    @Param('walletAddress') wallet: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUserByWallet(wallet, dto);
  }
}
