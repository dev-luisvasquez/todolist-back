import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: { name: string; last_name: string; email: string; password: string; birthday?: Date }) {
    return this.prisma.users.create({
      data: {
        id: uuidv4(),
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        birthday: data.birthday || null,
        password: data.password,
      },
    });
  }
}
