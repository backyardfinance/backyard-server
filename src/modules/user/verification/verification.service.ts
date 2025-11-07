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

    await this.prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    return { ok: true };
  }
}
