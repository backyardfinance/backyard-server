import { Body, Controller, Post, Query } from '@nestjs/common';
import { VerifySiwsDto } from '../../dto';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('siwe/nonce')
  async nonce(@Query('address') address: string) {
    return this.userService.createNonce(address || 'anonymous');
  }

  @Post('siws/verify')
  async verifySiws(@Body() dto: VerifySiwsDto) {
    return this.userService.verifySiws(dto);
  }
}
