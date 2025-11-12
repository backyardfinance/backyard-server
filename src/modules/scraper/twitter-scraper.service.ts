import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FollowStatusResponse, RetweetStatusResponse } from '../../dto';

@Injectable()
export class TwitterService {
  private readonly scraperUrl: string;
  private readonly scraperToken: string;
  private readonly targetUsername: string;
  private readonly targetTweetId: string;

  constructor(private readonly configService: ConfigService) {
    this.scraperUrl = this.configService.get<string>('twitter.scraper_url');
    this.scraperToken = this.configService.get<string>('twitter.scraper_token');
    this.targetUsername = this.configService.get<string>(
      'twitter.target_username',
    );
    this.targetTweetId = this.configService.get<string>(
      'twitter.target_tweet_id',
    );
  }

  public async checkFollow(
    actorUsername: string,
  ): Promise<FollowStatusResponse> {
    try {
      const { data } = await axios.post<FollowStatusResponse>(
        `${this.scraperUrl}/v1/checks/follow`,
        {
          actor_username: actorUsername,
          target_username: this.targetUsername,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Token': this.scraperToken,
          },
        },
      );

      return data;
    } catch (error) {
      throw new Error(
        `Failed to check follow status: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  public async checkRetweet(
    actorUsername: string,
  ): Promise<RetweetStatusResponse> {
    try {
      const { data } = await axios.post<RetweetStatusResponse>(
        `${this.scraperUrl}/v1/checks/retweet`,
        {
          actor_username: actorUsername,
          tweet_id: this.targetTweetId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Token': this.scraperToken,
          },
        },
      );

      return data;
    } catch (error) {
      throw new Error(
        `Failed to check retweet status: ${error.response?.data?.message || error.message}`,
      );
    }
  }
}
