import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { CreateUserDto } from '../../dto';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

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
}
