import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'juan.perez@example.com',
        format: 'email'
    })
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'password123',
        minLength: 6
    })
    password: string;
}

export class UserInfoDto {
    @ApiProperty({
        description: 'ID único del usuario',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    id: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan'
    })
    name: string;

    @ApiProperty({
        description: 'Apellido del usuario',
        example: 'Pérez'
    })
    last_name: string;

    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'juan.perez@example.com'
    })
    email: string;
}

export class LoginResponseDto {
    @ApiProperty({
        description: 'Token JWT de acceso',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    access_token: string;

    @ApiProperty({
        description: 'Información del usuario',
        type: UserInfoDto
    })
    user: UserInfoDto;
}
