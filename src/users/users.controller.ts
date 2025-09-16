import { Controller, Get, Post, Param, Body, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiBody,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiBadRequestResponse 
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Put(':id')
    @ApiOperation({ 
        summary: 'Actualizar usuario por ID',
        description: 'Actualiza la información de un usuario específico por su ID'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'ID único del usuario',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    @ApiBody({ 
        type: UpdateUserDto,
        description: 'Datos del usuario a actualizar'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Usuario actualizado exitosamente',
        type: UserResponseDto
    })
    @ApiNotFoundResponse({ 
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({ 
        description: 'Datos de entrada inválidos'
    })
    async updateUserById(@Param('id') id: string, @Body() userData: UpdateUserDto) {
        return this.usersService.updatedUserById(id, userData);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Obtener usuario por ID',
        description: 'Obtiene la información de un usuario específico por su ID'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'ID único del usuario',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Usuario encontrado exitosamente',
        type: UserResponseDto
    })
    @ApiNotFoundResponse({ 
        description: 'Usuario no encontrado'
    })
    async getUserById(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Obtener todos los usuarios',
        description: 'Obtiene una lista de todos los usuarios registrados'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Lista de usuarios obtenida exitosamente',
        type: [UserResponseDto]
    })
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Delete(':id')
    @ApiOperation({ 
        summary: 'Eliminar usuario por ID',
        description: 'Elimina un usuario específico por su ID'
    })
    @ApiParam({ 
        name: 'id', 
        description: 'ID único del usuario',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Usuario eliminado exitosamente',
        type: UserResponseDto
    })
    @ApiNotFoundResponse({ 
        description: 'Usuario no encontrado'
    })
    async deleteUserById(@Param('id') id: string) {
        return this.usersService.deleteUserById(id);
    }
}
