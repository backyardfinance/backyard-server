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
  // mail: {
  //   host: env.string('MAIL_HOST'),
  //   port: env.string('MAIL_PORT'),
  //   user: env.string('MAIL_USER'),
  //   gmailAppPassword: env.string('GMAIL_APP_PASSWORD'),
  //   mail_from_name_and_address: 'Backyard Finance backyardfinance@gmail.com',
  // },
});
