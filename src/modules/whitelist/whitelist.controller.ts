import * as Sentry from '@sentry/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhitelistService } from './whitelist.service';
import { WhitelistStatusDto, WhitelistParticipantDto } from '../../dto';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Controller('whitelist')
@ApiTags('whitelist')
export class WhitelistController {
  constructor(
    private readonly whitelistService: WhitelistService,
    @InjectPinoLogger(WhitelistController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @SkipThrottle()
  @ApiOkResponse({
    type: WhitelistStatusDto,
    description: 'Get authenticated user whitelist status',
  })
  async getWhitelistStatus(@Req() req: Request & { user: { userId: string } }) {
    const userId = req.user.userId;
    return this.whitelistService.getWhitelistStatus(userId);
  }

  @Get('participants')
  @ApiOkResponse({
    type: WhitelistParticipantDto,
    description: 'Get all whitelist participants count',
  })
  async getAllParticipants() {
    const count =
      await this.whitelistService.getAllWhitelistParticipantsCount();

    Sentry.metrics.gauge('whitelist_participants_count', count);
    return { count };
  }

  // @Get('participants')
  // @ApiOkResponse({
  //   type: [WhitelistParticipantDto],
  //   description: 'Get all whitelist participants',
  // })
  // async getAllParticipants() {
  //   return this.whitelistService.getAllWhitelistParticipants();
  // }

  // @Get('completed')
  // @ApiOkResponse({
  //   type: [WhitelistParticipantDto],
  //   description: 'Get whitelist participants who completed all tasks',
  // })
  // async getCompletedParticipants() {
  //   return this.whitelistService.getCompletedWhitelistParticipants();
  // }
}
