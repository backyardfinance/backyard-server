import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhitelistParticipant } from '@prisma/client';

@Injectable()
export class WhitelistService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateWhitelistEntry(
    userId: string,
  ): Promise<WhitelistParticipant> {
    let whitelist = await this.prisma.whitelistParticipant.findUnique({
      where: { userId },
    });

    if (!whitelist) {
      whitelist = await this.prisma.whitelistParticipant.create({
        data: {
          userId,
          wallet_connected: true, // User must have wallet to be authenticated
        },
      });
    }

    return whitelist;
  }

  async getWhitelistStatus(userId: string) {
    const whitelist = await this.getOrCreateWhitelistEntry(userId);

    // Get user info for additional context
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        wallet: true,
        email: true,
        xId: true,
        xUsername: true,
        isEmailVerified: true,
      },
    });

    // Calculate completion percentage
    const tasks = [
      whitelist.wallet_connected,
      whitelist.email_verified,
      whitelist.twitter_linked,
      whitelist.twitter_followed,
      whitelist.post_retweeted,
    ];
    const completedTasks = tasks.filter(Boolean).length;
    const totalTasks = tasks.length;
    const completionPercentage = Math.round(
      (completedTasks / totalTasks) * 100,
    );

    return {
      userId,
      wallet: user?.wallet,
      email: user?.email,
      twitterUsername: user?.xUsername,
      tasks: {
        wallet_connected: whitelist.wallet_connected,
        email_verified: whitelist.email_verified,
        twitter_linked: whitelist.twitter_linked,
        twitter_followed: whitelist.twitter_followed,
        post_retweeted: whitelist.post_retweeted,
      },
      progress: {
        completed: completedTasks,
        total: totalTasks,
        percentage: completionPercentage,
      },
      isComplete: completedTasks === totalTasks,
      createdAt: whitelist.createdAt,
      updatedAt: whitelist.updatedAt,
    };
  }

  getAllWhitelistParticipantsCount() {
    return this.prisma.whitelistParticipant.count();
  }

  async getAllWhitelistParticipants() {
    const participants = await this.prisma.whitelistParticipant.findMany({
      include: {
        user: {
          select: {
            wallet: true,
            email: true,
            xUsername: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return participants.map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      wallet: participant.user.wallet,
      email: participant.user.email,
      twitterUsername: participant.user.xUsername,
      tasks: {
        wallet_connected: participant.wallet_connected,
        email_verified: participant.email_verified,
        twitter_linked: participant.twitter_linked,
        twitter_followed: participant.twitter_followed,
        post_retweeted: participant.post_retweeted,
      },
      isComplete:
        participant.wallet_connected &&
        participant.email_verified &&
        participant.twitter_linked &&
        participant.twitter_followed &&
        participant.post_retweeted,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
    }));
  }

  async getCompletedWhitelistParticipants() {
    const participants = await this.prisma.whitelistParticipant.findMany({
      where: {
        wallet_connected: true,
        email_verified: true,
        twitter_linked: true,
        twitter_followed: true,
        post_retweeted: true,
      },
      include: {
        user: {
          select: {
            wallet: true,
            email: true,
            xUsername: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return participants.map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      wallet: participant.user.wallet,
      email: participant.user.email,
      twitterUsername: participant.user.xUsername,
      completedAt: participant.updatedAt,
    }));
  }
}
