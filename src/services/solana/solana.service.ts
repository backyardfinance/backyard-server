import { Injectable } from '@nestjs/common';
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
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
  ExtensionType,
  getMintLen,
  createInitializeNonTransferableMintInstruction,
  createInitializeMint2Instruction,
} from '@solana/spl-token';
import { DatabaseService } from '../../database';
import { Strategy } from '@prisma/client';
import axios from 'axios';
import { UserTokenView } from '../../dto';
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
    const rpc =
      this.config.get<string>('rpc_url') || 'https://api.devnet.solana.com';
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

  async createStrategy(
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

  async getStrategies(userId: string) {
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

  async createVault(protocolName: string) {
    // vault id = public key; in db it's a public_key field
    const vaultId = Keypair.generate().publicKey;

    const tx = new Transaction();

    const ix = await this.program.methods
      .createVault(vaultId)
      .accounts({})
      .instruction();

    tx.add(ix);

    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('finalized');
    tx.recentBlockhash = blockhash;
    tx.feePayer = this.master.publicKey;
    tx.sign(this.master);

    const sig = await this.connection.sendRawTransaction(tx.serialize());
    const conf = await this.connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      'confirmed',
    );

    if (conf.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(conf.value.err)}`);
    }

    // push vault to db
    const vault = await this.db.vault.create({
      data: {
        public_key: vaultId.toString(),
        name: 'jupiter',
        tvl: 0,
        apy: 0,
      },
    });

    const vaultPdaAddress = this.getVaultPda(vaultId);

    return {
      signature: sig,
      confirmation: conf.value,
      vault: {
        id: vault.id,
        publicKey: vault.public_key,
        name: vault.name,
      },
      vaultPdaAddress,
    };
  }

  async createLP(
    mintAuthority: PublicKey,
    mintKeypair: Keypair = Keypair.generate(),
  ) {
    const extensions = [ExtensionType.NonTransferable];
    const mintLen = getMintLen(extensions);
    const lamports =
      await this.connection.getMinimumBalanceForRentExemption(mintLen);

    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: this.master.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const initializeNonTransferableIx =
      createInitializeNonTransferableMintInstruction(
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID,
      );

    const initializeMintIx = createInitializeMint2Instruction(
      mintKeypair.publicKey,
      6,
      mintAuthority,
      mintAuthority,
      TOKEN_2022_PROGRAM_ID,
    );

    const setupTx = new Transaction().add(
      createAccountIx,
      initializeNonTransferableIx,
      initializeMintIx,
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      setupTx,
      [this.master, mintKeypair],
    );

    return {
      signature,
      mint: mintKeypair.publicKey.toBase58(),
      authority: mintAuthority.toBase58(),
    };
  }

  private getVaultPda(vaultId: PublicKey) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), vaultId.toBuffer()],
      PROGRAM_ID,
    );
    return pda;
  }

  private async fetchJupList(): Promise<
    Record<
      string,
      {
        address: string;
        name: string;
        symbol: string;
        logoURI?: string;
        decimals: number;
      }
    >
  > {
    const url = 'https://token.jup.ag/strict';
    const { data } = await axios.get(url, { timeout: 10_000 });
    return Object.fromEntries((data as any[]).map((t) => [t.address, t]));
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

  public async getUserTokens(userId: string) {
    const user = await this.db.user.findFirstOrThrow({ where: { id: userId } });
    const userPubKey = new PublicKey(user.wallet);
    const { value } = await this.connection.getParsedTokenAccountsByOwner(
      userPubKey,
      { programId: TOKEN_PROGRAM_ID },
    );

    const base: UserTokenView[] = value
      .map((v) => {
        const info = (v.account.data as any).parsed.info;
        const mint = info.mint as string;
        const isNative = !!info.isNative; // WSOL акаунт
        const decimals = Number(info.tokenAmount.decimals);
        const amountUi = Number(info.tokenAmount.uiAmount) || 0;
        return { mint, isNative, decimals, amountUi };
      })
      .filter((t) => t.amountUi > 0 || t.isNative);

    if (base.length === 0) {
      return { tokens: [], totalValueUsd: 0 };
    }

    const jup = await this.fetchJupList();
    for (const t of base) {
      const meta = jup[t.mint];
      if (meta) {
        t.name = meta.name;
        t.symbol = meta.symbol;
        t.logoURI = meta.logoURI;
      }
      if (t.isNative) {
        t.name = t.name ?? 'Solana';
        t.symbol = t.symbol ?? 'SOL';
      }
    }

    const mints = [...new Set(base.map((t) => t.mint))];
    const limit = pLimit(5);
    const entries = await Promise.all(
      mints.map((m) =>
        limit(async () => [m, await this.getUsdPrice(m)] as const),
      ),
    );
    const prices = Object.fromEntries(entries);

    let totalValueUsd = 0;
    for (const t of base) {
      const p = prices[t.mint];
      if (typeof p === 'number') {
        t.priceUsd = p;
        t.valueUsd = +(p * t.amountUi).toFixed(6);
        totalValueUsd += t.valueUsd;
      }
    }

    const tokens = base.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
    return { tokens, totalValueUsd: +totalValueUsd.toFixed(6) };
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
