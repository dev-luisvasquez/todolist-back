import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { UserDto } from 'src/users/dto/user.dto';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly usersService: UsersService) { }

    async SignUp(userData: { userDto: UserDto }) {
        const hashedPassword = await bcrypt.hash(userData.userDto.password, 10);
        const newUser = await this.usersService.createUser({
            last_name: userData.userDto.last_name,
            name: userData.userDto.name,
            email: userData.userDto.email,
            password: hashedPassword,
        });
        return newUser;
    }

    async SignIn(userData: { email: string; password: string }) {
        const user = await this.prisma.users.findUnique({
            where: {
                email: userData.email
            }
        });
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Generar el token de acceso
        const payload = { userId: user.id, email: user.email };
        const secret = process.env.JWT_SECRET || 'default_secret';
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

        return { user, accessToken: token, refreshToken };
    }

    async RefreshTokenValidate(refreshToken: string) {
        try {
            const secret = process.env.JWT_SECRET || 'default_secret';
            const decoded = jwt.verify(refreshToken, secret) as { userId: string; email: string };
            // Generar nuevos tokens
            const newPayload = { userId: decoded.userId, email: decoded.email };
            const newAccessToken = jwt.sign(newPayload, secret, { expiresIn: '1h' });
            const newRefreshToken = jwt.sign(newPayload, secret, { expiresIn: '7d' });
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async validateToken(token: string) {
        try {
            const secret = process.env.JWT_SECRET || 'default_secret';
            const decoded = jwt.verify(token, secret) as { userId: string; email: string };
            // Buscar el usuario en la base de datos
            const user = await this.prisma.users.findUnique({
                where: { id: decoded.userId }
            });
            return user;
        } catch (error) {
            return null;
        }
    }

}

