import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './interfaces/auth.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    if (!authHeader) {
      throw new UnauthorizedException('Encabezado Authorization no encontrado');
    }

    const parts = authHeader.trim().split(/\s+/);
    const scheme = parts[0];
    const token = parts[1];
    if (!/^Bearer$/i.test(scheme) || !token) {
      throw new UnauthorizedException('Formato de Authorization inválido');
    }

    try {
      const user = await this.authService.validateToken(token);
      if (!user?.id) {
        throw new UnauthorizedException('Usuario no válido');
      }

      // No exponer password en el request
      const { password, ...safeUser } = user as any;
      req.user = safeUser;

      return next();
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
