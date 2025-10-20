import { Injectable } from '@nestjs/common';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { BACKYARD_PROGRAMS_IDL } from '../../idl';
import { ConfigService } from '../../config/config.module';
import BN from 'bn.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getMint,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { DatabaseService } from '../../database';
import { Strategy } from '@prisma/client';
import axios from 'axios';
import { TokenInfoResponse, UserTokenView } from '../../dto';
import pLimit from 'p-limit';

const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || '9J4gV4TL8EifN1PJGtysh1wp4wgzYoprZ4mYo8kS2PSv',
);

@Injectable()
export class SolanaService {
  readonly connection: Connection;
  readonly program: anchor.Program;
  readonly master?: Keypair;

  constructor(
    private readonly config: ConfigService,
    private readonly db: DatabaseService,
  ) {
    // const rpc =
    //   this.config.get<string>('rpc_url') || 'https://api.devnet.solana.com';
    const rpc = 'https://solana-mainnet.gateway.tatum.io';
    this.connection = new Connection(rpc, 'confirmed');

    const dummy = Keypair.generate();
    const wallet: anchor.Wallet = {
      publicKey: dummy.publicKey,
      payer: dummy,
      signAllTransactions: async (txs) => txs,
      signTransaction: async (tx) => tx,
    } as any;

    const provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });

    this.program = new anchor.Program(
      BACKYARD_PROGRAMS_IDL as anchor.Idl,
      provider as anchor.Provider,
    );

    const masterJson = this.config.get<string>('master_wallet_private_key');
    if (masterJson) {
      const secret = Uint8Array.from(JSON.parse(masterJson));
      this.master = Keypair.fromSecretKey(secret);
    }

    console.log('vaultId: ', Keypair.generate().publicKey);

    console.log('MASTER pubkey =', this.master?.publicKey.toBase58());

    const kp = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(process.env.MASTER_WALLET_PRIVATE_KEY!)),
    );
    console.log(kp.publicKey.toBase58());
  }

  private async ensureFunds(
    pubkey: PublicKey,
    minLamports = 0.05 * LAMPORTS_PER_SOL,
  ) {
    const bal = await this.connection.getBalance(pubkey, 'confirmed');
    if (bal >= minLamports) return;
    const sig = await this.connection.requestAirdrop(
      pubkey,
      1 * LAMPORTS_PER_SOL,
    );
    const latest = await this.connection.getLatestBlockhash('finalized');
    await this.connection.confirmTransaction(
      { signature: sig, ...latest },
      'confirmed',
    );
  }

  vaultPda(vaultId: PublicKey) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), vaultId.toBuffer()],
      PROGRAM_ID,
    );
    return pda;
  }

  public async adminCreateVault(vaultId: PublicKey, vaultName: string) {
    if (!this.master)
      throw new Error('MASTER_WALLET_PRIVATE_KEY not configured');

    const vault = this.vaultPda(vaultId);

    const tx = new Transaction();

    const ix = await this.program.methods
      .createVault(vaultId)
      .accounts({
        master: this.master.publicKey,
        vault,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    tx.add(ix);

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.feePayer = this.master.publicKey;

    tx.sign(this.master);

    await this.ensureFunds(this.master.publicKey);

    const sig = await this.connection.sendRawTransaction(tx.serialize());
    const conf = await this.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      'confirmed',
    );

    // push vault to db

    await this.db.vault.create({
      data: {
        address: vault.toString(),
        name: vaultName,
        apy: 0,
        tvl: 0,
      },
    });

    return {
      signature: sig,
      vault: vault.toBase58(),
      confirmation: conf.value,
    };
  }

  public async createStrategy(
    vaultId: string,
    deposited_amount: number,
    userId: string,
  ): Promise<Strategy> {
    const strategy = await this.db.strategy.create({
      data: {
        deposited_amount: deposited_amount,
        current_price: 0,
        user_id: userId,
      },
    });

    await this.db.vaultStartegy.create({
      data: {
        strategy_id: strategy.id,
        vault_id: vaultId,
      },
    });

    // map return data
    return strategy as Strategy;
  }

  public async getStrategies(userId: string) {
    console.log('userId: ', userId);
    const strategies = await this.db.strategy.findMany({
      where: {
        user_id: userId,
      },
    });
    return strategies.map((v) => ({
      ...v,
      deposited_amount: parseFloat(v.deposited_amount.toString()),
      current_price: parseFloat(v.current_price.toString()),
    }));
  }

  private async fetchJupList(mints: string[]) {
    const res = await fetch(
      `https://lite-api.jup.ag/tokens/v2/search?query=${mints.join(',')}`,
    );

    return await res.json();
  }

  private async fetchBirdeyePriceUsd(
    mint: string,
  ): Promise<number | undefined> {
    const key = process.env.BIRDEYE_API_KEY;
    try {
      const r = await axios.get('https://public-api.birdeye.so/defi/price', {
        params: { address: mint },
        headers: { 'X-API-KEY': key ?? '', accept: 'application/json' },
        timeout: 10_000,
      });
      const v = r?.data?.data?.value;
      return typeof v === 'number' ? v : undefined;
    } catch {
      return undefined;
    }
  }

  public async getUserTokens(
    userId: string,
  ): Promise<{ tokens: TokenInfoResponse[]; totalValueUsd: number }> {
    const user = await this.db.user.findFirstOrThrow({ where: { id: userId } });
    const userPubKey = new PublicKey(user.wallet);
    const { value } = await this.connection.getParsedTokenAccountsByOwner(
      userPubKey,
      { programId: TOKEN_PROGRAM_ID },
    );

    type RpcRow = {
      isNative: boolean;
      mint: string;
      tokenAmount: {
        amount: string;
        decimals: number;
        uiAmount: number;
        uiAmountString: string;
      };
    };

    const rpcRows: RpcRow[] = value.map((v) => {
      const info = (v.account.data as any).parsed.info;
      return {
        isNative: !!info.isNative,
        mint: info.mint as string,
        tokenAmount: {
          amount: info.tokenAmount.amount as string,
          decimals: Number(info.tokenAmount.decimals),
          uiAmount: Number(info.tokenAmount.uiAmount) || 0,
          uiAmountString: String(info.tokenAmount.uiAmountString),
        },
      };
    });
    const filtered = rpcRows.filter(
      (r) => r.tokenAmount.uiAmount > 0 || r.isNative,
    );
    if (filtered.length === 0) return { tokens: [], totalValueUsd: 0 };

    const mints = [...new Set(filtered.map((r) => r.mint))];
    const tokenInfo = await this.fetchJupList(mints);

    const infoByMint = new Map(tokenInfo.map((ti) => [ti.id, ti]));

    let totalValueUsd = 0;

    const tokens: TokenInfoResponse[] = filtered.map((r) => {
      const ti: any = infoByMint.get(r.mint);

      const price =
        ti && typeof ti.usdPrice === 'number' && Number.isFinite(ti.usdPrice)
          ? (ti.usdPrice as number)
          : undefined;

      const valueUsd =
        price != null
          ? +(price * r.tokenAmount.uiAmount).toFixed(6)
          : undefined;

      if (valueUsd != null) totalValueUsd += valueUsd;

      return {
        address: r.mint,
        isNative: r.isNative,
        name: ti?.name ?? '',
        symbol: ti?.symbol ?? '',
        logoURI: ti?.icon,
        priceUsd: price,
        valueUsd,
        tokenAmount: {
          amount: Number(r.tokenAmount.amount),
          decimals: r.tokenAmount.decimals,
          uiAmount: r.tokenAmount.uiAmount,
          uiAmountString: r.tokenAmount.uiAmountString,
        },
      };
    });

    tokens.sort((a, b) => (b.valueUsd ?? -1) - (a.valueUsd ?? -1));

    return {
      tokens,
      totalValueUsd: +totalValueUsd.toFixed(6),
    };
  }

  private async fetchCoingeckoPriceUsd(
    mint: string,
  ): Promise<number | undefined> {
    try {
      const r = await axios.get(
        `https://api.coingecko.com/api/v3/onchain/simple/networks/solana/token_price/${mint}`,
        {
          headers: process.env.COINGECKO_API_KEY
            ? { 'x-cg-pro-api-key': process.env.COINGECKO_API_KEY }
            : {},
          timeout: 10_000,
        },
      );
      const first = Array.isArray(r?.data)
        ? r.data[0]
        : r?.data?.[mint] || r?.data;
      const p = first?.price_usd ?? first?.usd ?? first?.priceUSD;
      if (typeof p === 'number') return p;
      if (typeof p === 'string') return Number(p);
      return undefined;
    } catch {
      return undefined;
    }
  }

  private async getUsdPrice(mint: string): Promise<number | undefined> {
    const p1 = await this.fetchBirdeyePriceUsd(mint);
    if (p1 != null) return p1;
    return this.fetchCoingeckoPriceUsd(mint);
  }

  // get vaults from db by user addr
}
