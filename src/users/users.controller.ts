import { Controller, Get, Post, Param, Body, Delete, Put, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { FilesService } from '../files/files.service';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiBody,
    ApiBearerAuth,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiConsumes 
} from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly filesService: FilesService
    ) { }

    @Put('profile')
    @UseGuards(AuthGuard)
    @ApiOperation({ 
        summary: 'Actualizar perfil del usuario autenticado',
        description: 'Actualiza la información del usuario autenticado basado en el token JWT'
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
    async updateUserById(@Request() req: any, @Body() userData: UpdateUserDto) {
        const userId = req.user.id; // El ID viene del token JWT decodificado
        return this.usersService.updatedUserById(userId, userData);
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

    @Put('profile/avatar')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ 
        summary: 'Actualizar avatar del usuario',
        description: 'Actualiza el avatar del usuario autenticado. Elimina automáticamente el avatar anterior si existe.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Archivo de imagen para el nuevo avatar',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo de imagen del avatar'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Avatar actualizado exitosamente',
        type: UserResponseDto
    })
    @ApiNotFoundResponse({ 
        description: 'Usuario no encontrado'
    })
    @ApiBadRequestResponse({ 
        description: 'Archivo inválido o no proporcionado'
    })
    async updateUserAvatar(
        @Request() req: any, 
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new Error('No file uploaded');
        }

        const userId = req.user.id;
        
        // Obtener el usuario actual para obtener el avatar anterior
        const currentUser = await this.usersService.getUserById(userId);
        const oldAvatarUrl = currentUser?.avatar;

        // Subir nueva imagen y eliminar la anterior
        const uploadResult = await this.filesService.uploadImageAndReplaceOld(
            file, 
            'todolist/avatars', 
            oldAvatarUrl && oldAvatarUrl !== 'https://res.cloudinary.com/dybx8epyl/image/upload/v1758838963/avatar/azzr32udriidmnar14p7.jpg' 
                ? oldAvatarUrl 
                : undefined // No eliminar el avatar por defecto
        );

        // Actualizar el usuario con la nueva URL del avatar
        return this.usersService.updatedUserById(userId, {
            avatar: uploadResult.secure_url
        });
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
