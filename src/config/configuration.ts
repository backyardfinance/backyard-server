import { env } from './env';

export default () => ({
  env: env.string('ENV'),
  port: env.int('PORT', 4000),
  rpc_url: env.string('RPC_URL'),
  redis: env.string('REDIS'),
  master_wallet_private_key: env.string('MASTER_WALLET_PRIVATE_KEY'),
  app_test_mode: env.bool('APP_TEST_MODE', false),
  jwt_secret: env.string('JWT_SECRET'),
  jwt_refresh_secret: env.string('JWT_REFRESH_SECRET'),
  resend: {
    api_key: env.string('RESEND_API_KEY'),
    from_email: env.string('RESEND_FROM_EMAIL', 'backyardfinance@gmail.com'),
    from_name: env.string('RESEND_FROM_NAME', 'Backyard Finance'),
    verify_code_template_id: env.string('RESEND_VERIFY_CODE_TEMPLATE_ID'),
  },
  twitter: {
    client_id: env.string('TWITTER_CLIENT_ID'),
    client_secret: env.string('TWITTER_CLIENT_SECRET'),
    redirect_uri: env.string('TWITTER_REDIRECT_URI'),
  },
});
