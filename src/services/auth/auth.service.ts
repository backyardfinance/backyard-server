import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { UserXDto } from '../../dto';

@Injectable()
export class AuthService {
  private clientId: string;
  private redirectUri: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('TWITTER_CLIENT_ID');
    this.redirectUri = this.config.get<string>('TWITTER_REDIRECT_URI');
  }

  // 1️⃣ Create authorization URL
  getAuthUrl() {
    const baseUrl = 'https://twitter.com/i/oauth2/authorize';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'users.read tweet.read offline.access',
      state: 'random_state_123',
      code_challenge: 'challenge',
      code_challenge_method: 'plain',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async handleCallback(code: string) {
    const tokenUrl = 'https://api.x.com/2/oauth2/token';
    const redirectUri = this.config.get<string>('TWITTER_REDIRECT_URI');
    const clientId = this.config.get<string>('TWITTER_CLIENT_ID');
    const clientSecret = this.config.get<string>('TWITTER_CLIENT_SECRET');

    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: 'challenge', // must match your challenge
      client_id: clientId,
    });

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${clientId}:${clientSecret}`).toString('base64'), // confidential client
    };

    const tokenResponse = await axios.post(tokenUrl, body.toString(), {
      headers,
    });
    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://api.x.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      xId: userResponse.data.data.id,
      xUserName: userResponse.data.data.username,
    } as UserXDto;
  }
}
