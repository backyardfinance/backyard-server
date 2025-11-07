import {
  Injectable,
  PipeTransform,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class WalletToUserPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(wallet: string) {
    if (!wallet) {
      throw new BadRequestException('Wallet is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { wallet },
      select: { id: true },
    });

    if (!user)
      throw new NotFoundException('User with provided wallet not found');

    return user.id;
  }
}
