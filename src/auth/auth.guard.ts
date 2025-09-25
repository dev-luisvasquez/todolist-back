import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        
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
            
            // Agregar el usuario al request para uso posterior
            request.user = user;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Token invalid or expired');
        }
    }
}
