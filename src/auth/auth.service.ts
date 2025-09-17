import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { sendEmail } from 'src/utils/email.util';
import * as jwt from 'jsonwebtoken';


@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly usersService: UsersService) { }

    async SignUp(userData: { userDto: CreateUserDto }) {
        try {
            const user = await this.prisma.users.findUnique({
                where: { email: userData.userDto.email }
            });
            if (user) {
                throw new ConflictException('Email already in use');
            }
            const hashedPassword = await bcrypt.hash(userData.userDto.password, 10);
            const newUser = await this.usersService.createUser({
                last_name: userData.userDto.last_name,
                name: userData.userDto.name,
                email: userData.userDto.email,
                password: hashedPassword,
            });
            const emailUrl = await sendEmail({
                to: newUser.email,
                subject: 'Bienvenido a TodoList',
                templatePath: 'src/utils/email-templates/signup.html',
                variables: { name: newUser.name, lastName: newUser.last_name }
            });
            return { user: newUser, emailPreviewUrl: emailUrl };
        } catch (error) {
            throw error instanceof ConflictException ? error : new BadRequestException(error.message);
        }
    }

    async SignIn(userData: { email: string; password: string }) {
        try {
            const user = await this.prisma.users.findUnique({
                where: { email: userData.email }
            });
            // Mensaje genérico por seguridad
            if (!user) {
                throw new UnauthorizedException('Usuario o contraseña incorrectos');
            }
            const isPasswordValid = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Usuario o contraseña incorrectos');
            }

            // Generar el token de acceso
            const payload = { userId: user.id, email: user.email };
            const secret = process.env.JWT_SECRET || 'default_secret';
            const token = jwt.sign(payload, secret, { expiresIn: '1h' });
            const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

            return { user, access_Token: token, refresh_Token: refreshToken };
        } catch (error) {
            throw error instanceof UnauthorizedException ? error : new BadRequestException(error.message);
        }
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
            throw new UnauthorizedException('Invalid token');
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
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    async ResetPassword(email: string, oldPassword: string, newPassword: string) {
        try {
            const user = await this.prisma.users.findUnique({
                where: { email }
            });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                throw new BadRequestException('Invalid old password');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.prisma.users.update({
                where: { email },
                data: { password: hashedPassword }
            });
        } catch (error) {
            throw error instanceof NotFoundException ? error : new BadRequestException(error.message);
        }
    }

    async RequestPasswordRecovery(email: string) {
        try {
            const user = await this.prisma.users.findUnique({ where: { email } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            // Generar token temporal (expira en 15 minutos)
            const secret = process.env.JWT_SECRET || 'default_secret';
            const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '15m' });
            // Construir enlace para frontend
            const recoveryUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
            // Enviar correo con el enlace
            await sendEmail({
                to: email,
                subject: 'Recupera tu contraseña',
                templatePath: 'src/utils/email/recoverPassword.html',
                variables: { name: user.name, lastName: user.last_name, recoveryUrl }
            });
            return { message: 'Correo de recuperación enviado' };
        } catch (error) {
            throw error instanceof NotFoundException ? error : new BadRequestException(error.message);
        }
    }

    
    async RecoverPasswordWithToken(token: string, newPassword: string) {
        try {
            const secret = process.env.JWT_SECRET || 'default_secret';
            const decoded = jwt.verify(token, secret) as { userId: string; email: string };
            const user = await this.prisma.users.findUnique({ where: { id: decoded.userId } });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.prisma.users.update({
                where: { id: decoded.userId },
                data: { password: hashedPassword }
            });
            return { message: 'Contraseña actualizada correctamente' };
        } catch (error) {
            throw new BadRequestException('Token inválido o expirado');
        }
    }
}
