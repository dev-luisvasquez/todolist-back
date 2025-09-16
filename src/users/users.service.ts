import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {v4 as uuidv4} from 'uuid';
import { UserDto } from './dto/user.dto';

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

  async updatedUserById(id: string, data: UserDto) {
    return this.prisma.users.update({
      where: { id },
      data: {
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        birthday: data.birthday || null,
        password: data.password,
      },
    });
  }

  async getUserById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async deleteUserById(id: string) {
    return this.prisma.users.delete({
      where: { id },
    });
  }
}
