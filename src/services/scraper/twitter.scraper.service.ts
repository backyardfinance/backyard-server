import { Injectable } from '@nestjs/common';
import { TwitterVerifyDto } from '../../dto';

@Injectable()
export class TwitterService {
  public async verifyTwitterAccount(
    twitterUserId: string,
  ): Promise<TwitterVerifyDto> {
    return {
      subscribed: true,
      retweeted: true,
    };
  }
}
