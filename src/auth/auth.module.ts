import { MiddlewareConsumer, Module, NestModule, RequestMethod, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';

@Module({
    imports: [forwardRef(() => UsersModule)],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                // Endpoints públicos de auth
                { path: 'auth/signin', method: RequestMethod.POST },
                { path: 'auth/signup', method: RequestMethod.POST },
                { path: 'auth/refresh-token', method: RequestMethod.POST },
                { path: 'auth/request-password-recovery', method: RequestMethod.POST },
                { path: 'auth/recover-password', method: RequestMethod.POST },
                // Preflight CORS
                { path: 'auth/(.*)', method: RequestMethod.OPTIONS },
                // Swagger (ajusta si usas otra ruta)
                { path: 'docs', method: RequestMethod.ALL },
                { path: 'docs-json', method: RequestMethod.ALL }
            )
            .forRoutes('*'); // Solo rutas del AuthController
    }
}

