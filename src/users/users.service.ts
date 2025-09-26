import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto, CreateUserDto } from './dto/user.dto';
import { DateTime } from 'luxon';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async createUser(data: CreateUserDto) {
    try {
      return await this.prisma.users.create({
        data: {
          id: uuidv4(),
          name: data.name,
          last_name: data.last_name,
          email: data.email,
          birthday: data.birthday !== undefined ? data.birthday : undefined,
          password: data.password,
          avatar: data.avatar || 'https://res.cloudinary.com/dybx8epyl/image/upload/v1758838963/avatar/azzr32udriidmnar14p7.jpg', // Avatar por defecto
        },
      });
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async updatedUserById(id: string, data: UpdateUserDto) {
    try {
      const updateData: UpdateUserDto = {
        name: data.name,
        last_name: data.last_name,
        email: data.email,
        birthday: data.birthday !== undefined ? data.birthday : undefined,
        updated_at: DateTime.now().toJSDate(),
      };

      // Solo incluir avatar si está presente en los datos
      if (data.avatar !== undefined) {
        updateData.avatar = data.avatar;
      }

      return await this.prisma.users.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async getUserById(id: string) {
    try {
      return await this.prisma.users.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      return await this.prisma.users.findMany();
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async deleteUserById(id: string) {
    try {
      // Verifica si el usuario existe antes de eliminar
      const user = await this.prisma.users.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found.`);
      }
      return await this.prisma.users.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}
