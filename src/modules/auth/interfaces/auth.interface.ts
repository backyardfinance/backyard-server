export interface AuthResult {
  user: {
    userId: string;
    wallet: string;
  };
  accessToken: string;
  refreshToken: string;
}
