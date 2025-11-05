import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { generateNonce } from 'siwe';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';
import { DatabaseService } from '../../database';
import { CreateUserDto, SendEmailDto, VerifyEmailDto } from '../../dto';
import { EmailService } from '../email/email.service';
import { EmailTemplate } from '../email/types';
import { VerificationService } from './verification/verification.service';

@Injectable()
export class UserService {
  constructor(
    private readonly db: DatabaseService,
    private readonly emailService: EmailService,
    private readonly verificationService: VerificationService,
  ) {}

  public async getUsers() {
    const users = await this.db.user.findMany();
    return users.map((user) => ({
      userId: user.id,
      name: user.name,
      wallet: user.wallet,
    }));
  }

  public async createUser(dto: CreateUserDto) {
    return this.db.user.create({
      data: {
        wallet: dto.walletAddress,
        name: dto.name,
      },
    });
  }

  public async sendEmail(dto: SendEmailDto) {
    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new Error(
        'User with this email does not exist. Please register first.',
      );
    }
    const verifyCode = await this.verificationService.issueCode(user.id);
    await this.emailService.sendVerifyCodeEmail({
      to: dto.email,
      subject: 'Welcome to Backyard Finance',
      template: EmailTemplate.VerifyCode,
      data: {
        verifyCode: verifyCode,
      },
    });
  }

  public async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new Error(
        'User with this email does not exist. Please register first.',
      );
    }
    return await this.verificationService.verifyCode(user.id, dto.code);
  }

  public async createNonce(address: string) {
    const nonce = generateNonce();
    return { nonce };
  }

  public async verifySiws(body: {
    message: string;
    signature: string;
    address: string;
  }) {
    const { message, signature, address } = body;

    const messageBytes = new TextEncoder().encode(message);

    const sigBytes = Uint8Array.from(Buffer.from(signature, 'base64'));

    const pubKeyBytes = bs58.decode(address);

    const ok = nacl.sign.detached.verify(messageBytes, sigBytes, pubKeyBytes);
    if (!ok) {
      throw new UnauthorizedException('Invalid Solana signature');
    }

    const lines = message.split('\n').map((l) => l.trim());

    const walletLine = lines.find((l) => l.startsWith('Wallet: '));
    const walletAddr = walletLine?.replace('Wallet: ', '');

    // const domainLine = lines.find((l) => l.startsWith('Domain: '));
    // const nonceLine = lines.find((l) => l.startsWith('Nonce: '));
    // const domain = domainLine?.replace('Domain: ', '');
    // const nonce = nonceLine?.replace('Nonce: ', '');

    if (walletAddr !== address) {
      throw new UnauthorizedException('Address mismatch');
    }

    const user: User = await this.db.user.upsert({
      where: { wallet: address },
      create: { wallet: address },
      update: {},
    });

    // const accessToken = await this.createAccessToken(user.id, user.wallet);
    // const refreshToken = await this.createRefreshToken(user.id, user.wallet);

    const accessToken = '';
    const refreshToken = '';

    return { accessToken, refreshToken, userId: user.id };
  }
}
