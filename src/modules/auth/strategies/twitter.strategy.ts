import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@superfaceai/passport-twitter-oauth2';
import { ConfigService } from '@nestjs/config';

export interface TwitterProfile { 
  id: string;
  username: string;
  displayName: string;
  photos?: { value: string }[];
}

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('twitter.client_id'),
      clientSecret: configService.get<string>('twitter.client_secret'),
      callbackURL: configService.get<string>('twitter.redirect_uri'),
      scope: ['tweet.read', 'users.read', 'offline.access'],
      state: 'state',
      clientType: 'confidential',
      authorizationURL: 'https://x.com/i/oauth2/authorize',
      tokenURL: 'https://api.x.com/2/oauth2/token',
      passReqToCallback: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: TwitterProfile,
  ) {
    return {
      xId: profile.id,
      xUsername: profile.username,
      displayName: profile.displayName,
      accessToken,
      refreshToken,
    };
  }
}
