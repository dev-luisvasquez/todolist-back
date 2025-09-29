import { Controller, Post, Body, Headers, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { AuthDto, LoginResponseDto } from './dto/auth.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiHeader,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from './interfaces/auth.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @ApiOperation({
        summary: 'Registrar nuevo usuario',
        description: 'Crea una nueva cuenta de usuario en el sistema'
    })
    @ApiBody({
        type: CreateUserDto,
        description: 'Datos del usuario a registrar'
    })
    @ApiResponse({
        status: 201,
        description: 'Usuario registrado exitosamente',
        type: LoginResponseDto
    })
    @ApiBadRequestResponse({
        description: 'Datos de entrada inválidos o email ya existe'
    })
    async signUp(@Body() userDto: CreateUserDto) {
        return this.authService.SignUp({ userDto });
    }

    @Post('signin')
    @ApiOperation({
        summary: 'Iniciar sesión',
        description: 'Autentica un usuario con email y contraseña'
    })
    @ApiBody({
        type: AuthDto,
        description: 'Credenciales de acceso'
    })
    @ApiResponse({
        status: 200,
        description: 'Autenticación exitosa',
        type: LoginResponseDto
    })
    @ApiUnauthorizedResponse({
        description: 'Credenciales incorrectas'
    })
    @ApiBadRequestResponse({
        description: 'Datos de entrada inválidos'
    })
    async signIn(@Body() body: AuthDto) {
        return this.authService.SignIn(body);
    }

    @Post('refresh-token')
    @ApiOperation({
        summary: 'Renovar token de acceso',
        description: 'Genera un nuevo token de acceso usando el refresh token'
    })
    @ApiHeader({
        name: 'x-refresh-token',
        description: 'Refresh token',
        required: true,
        schema: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Token renovado exitosamente',
        type: LoginResponseDto
    })
    @ApiUnauthorizedResponse({
        description: 'Refresh token inválido o expirado'
    })
    async refreshToken(@Headers('x-refresh-token') refreshToken: string) {
        return this.authService.RefreshTokenValidate(refreshToken);
    }

    @Post('recover-password')
    @ApiOperation({
        summary: 'Recuperar contraseña',
        description: 'Establece una nueva contraseña usando el token de recuperación'
    })
    @ApiHeader({
        name: 'authorization',
        description: 'Bearer token de recuperación de contraseña',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
    })
    @ApiBody({
        description: 'Nueva contraseña',
        schema: {
            type: 'object',
            properties: {
                newPassword: {
                    type: 'string',
                    example: 'newPassword123',
                    minLength: 6
                }
            },
            required: ['newPassword']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Contraseña actualizada exitosamente'
    })
    @ApiUnauthorizedResponse({
        description: 'Token de recuperación inválido o expirado'
    })
    @ApiBadRequestResponse({
        description: 'Nueva contraseña inválida'
    })
    async recoverPassword(
        @Headers('authorization') authorization: string,
        @Body() body: { newPassword: string }
    ) {
        const token = authorization?.replace('Bearer ', '').trim();
        return this.authService.RecoverPasswordWithToken(token, body.newPassword);
    }

    @Post('request-password-recovery')
    @ApiOperation({
        summary: 'Solicitar recuperación de contraseña',
        description: 'Envía un email con el token para recuperar la contraseña'
    })
    @ApiBody({
        description: 'Email del usuario',
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    format: 'email',
                    example: 'juan.perez@example.com'
                }
            },
            required: ['email']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Email de recuperación enviado exitosamente'
    })
    @ApiNotFoundResponse({
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({
        description: 'Email inválido'
    })
    async requestPasswordRecovery(@Body() body: { email: string }) {
        return this.authService.RequestPasswordRecovery(body.email);
    }

    @Post('change-password')
    @ApiOperation({
        summary: 'Cambiar contraseña',
        description: 'Cambia la contraseña del usuario autenticado'
    })
    @ApiBearerAuth()
    @ApiBody({
        description: 'Datos de la nueva contraseña',
        schema: {
            type: 'object',
            properties: {
                oldPassword: {
                    type: 'string',
                    example: 'oldPassword123',
                    minLength: 6
                },
                newPassword: {
                    type: 'string',
                    example: 'newPassword123',
                    minLength: 6
                }
            },
            required: ['oldPassword', 'newPassword']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Contraseña cambiada exitosamente'
    })
    @ApiUnauthorizedResponse({
        description: 'Token de acceso inválido o expirado'
    })
    @ApiBadRequestResponse({
        description: 'Datos de entrada inválidos'
    })
    async changePassword(
        @Req() req: AuthenticatedRequest,
        @Body() body: { oldPassword: string; newPassword: string }
    ) {
        if (!req.user?.id) {
            throw new UnauthorizedException('Token de acceso inválido o expirado');
        }
        return this.authService.ChangePassword(String(req.user.id), body.oldPassword, body.newPassword);
    }
};
