import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database';
import { CreateUserDto } from '../../dto';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  public async createUser(dto: CreateUserDto) {
    return this.db.user.create({
      data: {
        wallet: dto.walletAddress,
        name: dto.name,
      },
    });
  }
}
