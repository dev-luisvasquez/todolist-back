import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';

export class UserDto {
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

    @ApiPropertyOptional({
        description: 'Fecha de nacimiento del usuario',
        example: '1990-01-15T00:00:00.000Z'
    })
    birthday?: Date;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'password123'
    })
    password: string;

    @ApiPropertyOptional({
        description: 'Fecha de creación del usuario',
        example: '2023-01-01T00:00:00.000Z'
    })
    created_at?: Date;

    @ApiPropertyOptional({
        description: 'Fecha de última actualización del usuario',
        example: '2023-01-02T00:00:00.000Z'
    })
    updated_at?: Date;
}

export class CreateUserDto extends OmitType(UserDto, ['id', 'created_at', 'updated_at'] as const) {
    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan',
        minLength: 1
    })
    name: string;

    @ApiProperty({
        description: 'Apellido del usuario',
        example: 'Pérez',
        minLength: 1
    })
    last_name: string;

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

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {}

export class UserResponseDto extends OmitType(UserDto, ['password'] as const) {}