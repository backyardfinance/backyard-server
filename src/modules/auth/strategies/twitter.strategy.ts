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
    const clientID = configService.get<string>('twitter.client_id');
    const clientSecret = configService.get<string>('twitter.client_secret');
    const callbackURL = configService.get<string>('twitter.redirect_uri');

    console.log('[TwitterStrategy] Initializing with config:');
    console.log(
      '[TwitterStrategy] Client ID:',
      clientID ? 'present' : 'missing',
    );
    console.log(
      '[TwitterStrategy] Client Secret:',
      clientSecret ? 'present' : 'missing',
    );
    console.log('[TwitterStrategy] Callback URL:', callbackURL);

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['tweet.read', 'users.read', 'offline.access'],
      state: 'state',
      clientType: 'confidential',
      authorizationURL: 'https://x.com/i/oauth2/authorize',
      tokenURL: 'https://api.x.com/2/oauth2/token',
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: TwitterProfile,
  ) {
    console.log(
      '[TwitterStrategy] Validate called for user:',
      profile.username,
    );
    console.log('[TwitterStrategy] Request cookies:', req.cookies);

    return {
      xId: profile.id,
      xUsername: profile.username,
      displayName: profile.displayName,
      accessToken,
      refreshToken,
    };
  }
}
