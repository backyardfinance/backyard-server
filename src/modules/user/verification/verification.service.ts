import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}
  private genCode(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  public async issueCode(userId: string): Promise<string> {
    const code = this.genCode();
    await this.prisma.verificationCode.create({
      data: { userId, code },
    });

    return code.split('').join(' ');
  }

  public async verifyCode(
    userId: string,
    code: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    const record = await this.prisma.verificationCode.findFirst({
      where: { userId, consumedAt: null, code },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return { ok: false, reason: 'INVALID_CODE' };
    }

    // Use transaction to update verification code, user, and whitelist participant
    await this.prisma.$transaction(async (tx) => {
      // Mark verification code as consumed
      await tx.verificationCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });

      // Update user's email verification status
      await tx.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });

      // Update or create whitelist participant entry
      const existingWhitelist = await tx.whitelistParticipant.findUnique({
        where: { userId },
      });

      if (existingWhitelist) {
        await tx.whitelistParticipant.update({
          where: { userId },
          data: { email_verified: true },
        });
      } else {
        await tx.whitelistParticipant.create({
          data: {
            userId,
            wallet_connected: true, // User must have wallet to be authenticated
            email_verified: true,
          },
        });
      }
    });

    return { ok: true };
  }
}
