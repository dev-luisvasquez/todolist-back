import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('header authorization no found');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      // Validar el token y obtener el usuario
      const user = await this.authService.validateToken(token);
      if (!user) {
        throw new UnauthorizedException('User not valid');
      }
      req['user'] = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }
}
