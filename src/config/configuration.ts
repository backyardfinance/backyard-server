import { env } from './env';

export default () => ({
  env: env.string('ENV'),
  port: env.int('PORT', 4000),
  rpc_url: env.string('RPC_URL'),
  program_id: env.string('PROGRAM_ID'),
  master_wallet_private_key: env.string('MASTER_WALLET_PRIVATE_KEY'),
});
