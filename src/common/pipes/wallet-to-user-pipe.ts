import {
  Injectable,
  PipeTransform,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database';

@Injectable()
export class WalletToUserPipe implements PipeTransform {
  constructor(private readonly db: DatabaseService) {}

  async transform(wallet: string) {
    if (!wallet) {
      throw new BadRequestException('Wallet is required');
    }

    const user = await this.db.user.findUnique({
      where: { wallet },
      select: { id: true },
    });

    if (!user)
      throw new NotFoundException('User with provided wallet not found');

    return user.id;
  }
}
