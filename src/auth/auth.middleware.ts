import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './interfaces/auth.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
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
      
      // Agregar el usuario al request con tipado seguro
      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }
}
