import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  SendEmailDto,
  UpdateUserDto,
  VerifyEmailDto,
} from '../../dto';
import { VerificationService } from './verification/verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { TwitterService } from '../scraper/twitter-scraper.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly mailService: MailService,
    private readonly verificationService: VerificationService,
    private readonly twitterService: TwitterService,
  ) {}

  async findByWallet(wallet: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { wallet },
    });
  }

  async findOrCreate(dto: CreateUserDto): Promise<User> {
    const { wallet } = dto;
    let user = await this.prisma.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { wallet },
      });
    }

    return user;
  }

  async getUsers() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => ({
      userId: user.id,
      wallet: user.wallet,
      email: user.email,
    }));
  }

  async createUser(dto: CreateUserDto) {
    const { wallet } = dto;
    return this.prisma.user.create({
      data: {
        wallet,
      },
    });
  }

  async updateUserByWallet(walletAddress: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { wallet: walletAddress },
    });

    if (!user) {
      throw new Error('User not founded.');
    }

    return this.prisma.user.update({
      where: { wallet: walletAddress },
      data: dto,
    });
  }

  verifyUserTwitterActions(userId: string) {
    return this.twitterService.verifyTwitterAccount(userId);
  }

  async sendEmail(dto: SendEmailDto) {
    const user = await this.prisma.user.findUnique({
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
    // await this.mailService.sendVerifyCodeEmail({
    //   to: dto.email,
    //   subject: 'Welcome to Backyard Finance',
    //   template: EmailTemplate.VerifyCode,
    //   data: {
    //     verifyCode: verifyCode,
    //   },
    // });
  }

  public async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
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
}
