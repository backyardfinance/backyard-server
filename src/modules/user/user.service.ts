import { Injectable, ConflictException } from '@nestjs/common';
import {
  CreateUserDto,
  FollowStatusResponse,
  RetweetStatusResponse,
  SendEmailDto,
  UpdateUserDto,
  VerifyEmailDto,
} from '../../dto';
import { VerificationService } from './verification/verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { TwitterService } from '../scraper/twitter-scraper.service';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
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
      // Create user and whitelist participant in a transaction
      user = await this.prisma.user.create({
        data: {
          wallet,
          WhitelistParticipant: {
            create: {
              wallet_connected: true,
            },
          },
        },
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

  async checkUserFollow(userId: string): Promise<FollowStatusResponse> {
    // Get user and ensure Twitter is linked
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.xUsername) {
      throw new Error(
        'Twitter account not linked. Please link your Twitter account first.',
      );
    }

    // Check if user follows the target account
    const followStatus = await this.twitterService.checkFollow(user.xUsername);

    // Update WhitelistParticipant if user is following
    if (followStatus.is_following) {
      const existingWhitelist =
        await this.prisma.whitelistParticipant.findUnique({
          where: { userId },
        });

      if (existingWhitelist) {
        await this.prisma.whitelistParticipant.update({
          where: { userId },
          data: { twitter_followed: true },
        });
      } else {
        await this.prisma.whitelistParticipant.create({
          data: {
            userId,
            wallet_connected: true,
            twitter_linked: true,
            twitter_followed: true,
          },
        });
      }
    }

    return followStatus;
  }

  async checkUserRetweet(userId: string): Promise<RetweetStatusResponse> {
    // Get user and ensure Twitter is linked
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.xUsername) {
      throw new Error(
        'Twitter account not linked. Please link your Twitter account first.',
      );
    }

    // Check if user retweeted the target post
    const retweetStatus = await this.twitterService.checkRetweet(
      user.xUsername,
    );

    // Update WhitelistParticipant if user has retweeted
    if (retweetStatus.has_retweeted) {
      const existingWhitelist =
        await this.prisma.whitelistParticipant.findUnique({
          where: { userId },
        });

      if (existingWhitelist) {
        await this.prisma.whitelistParticipant.update({
          where: { userId },
          data: { post_retweeted: true },
        });
      } else {
        await this.prisma.whitelistParticipant.create({
          data: {
            userId,
            wallet_connected: true,
            twitter_linked: true,
            post_retweeted: true,
          },
        });
      }
    }

    return retweetStatus;
  }

  async sendEmail(userId: string, dto: SendEmailDto) {
    const existingUserWithEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
      throw new ConflictException(
        'This email address is already registered to another account.',
      );
    }

    // Update the user's email field with the provided email
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.email },
    });

    // Generate verification code for the authenticated user
    const verifyCode = await this.verificationService.issueCode(userId);

    // Send verification email
    await this.mailService.sendVerifyCodeEmail({
      to: dto.email,
      subject: 'Welcome to Backyard Finance',
      data: {
        verifyCode: verifyCode,
      },
    });
  }

  public async verifyEmail(userId: string, dto: VerifyEmailDto) {
    // Verify the code against the authenticated user's ID
    // The verification service will update isEmailVerified and WhitelistParticipant.email_verified
    return await this.verificationService.verifyCode(userId, dto.code);
  }

  async linkTwitterToUser(
    userId: string,
    xId: string,
    xUsername: string,
  ): Promise<User> {
    // Update user with Twitter information
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        xId,
        xUsername,
      },
    });

    // Create or update WhitelistParticipant
    const existingWhitelist = await this.prisma.whitelistParticipant.findUnique(
      {
        where: { userId },
      },
    );

    if (existingWhitelist) {
      await this.prisma.whitelistParticipant.update({
        where: { userId },
        data: {
          twitter_linked: true,
        },
      });
    } else {
      await this.prisma.whitelistParticipant.create({
        data: {
          userId,
          wallet_connected: true, // User already has wallet if they're authenticated
          twitter_linked: true,
        },
      });
    }

    return updatedUser;
  }
}
