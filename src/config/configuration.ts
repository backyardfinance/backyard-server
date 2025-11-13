import { env } from './env';

export default () => ({
  env: env.string('ENV'),
  node_env: env.string('NODE_ENV', 'development'),
  port: env.int('PORT', 4000),
  rpc_url: env.string('RPC_URL'),
  redis: env.string('REDIS'),
  master_wallet_private_key: env.string('MASTER_WALLET_PRIVATE_KEY'),
  app_test_mode: env.bool('APP_TEST_MODE', false),
  jwt_secret: env.string('JWT_SECRET'),
  jwt_refresh_secret: env.string('JWT_REFRESH_SECRET'),
  session_secret: env.string('SESSION_SECRET'),
  frontend_url: env.string('FRONTEND_URL'),
  resend: {
    api_key: env.string('RESEND_API_KEY'),
    from_email: env.string('RESEND_FROM_EMAIL', null),
    from_name: env.string('RESEND_FROM_NAME', null),
    verify_code_template_id: env.string('RESEND_VERIFY_CODE_TEMPLATE_ID'),
  },
  twitter: {
    client_id: env.string('TWITTER_CLIENT_ID'),
    client_secret: env.string('TWITTER_CLIENT_SECRET'),
    redirect_uri: env.string('TWITTER_REDIRECT_URI'),
    scraper_url: env.string('TWITTER_SCRAPER_URL'),
    scraper_token: env.string('TWITTER_SCRAPER_TOKEN'),
    target_username: env.string('TWITTER_TARGET_USERNAME'),
    target_tweet_id: env.string('TWITTER_TARGET_TWEET_ID'),
  },
  is_whitelist_active: env.string('IS_WHITELIST_ACTIVE'),
  collection: env.string('COLLECTION'),
  merkle_tree: env.string('MERKLE_TREE'),
});
