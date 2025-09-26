import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
  UploadFileWithReplaceDto,
  UploadFromUrlDto,
  FileResponseDto,
  OptimizedUrlResponseDto,
  TransformedUrlResponseDto,
  DeleteFileResponseDto,
} from './dto/file.dto';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir archivo de imagen',
    description: 'Permite subir un archivo de imagen al servidor. Acepta formatos: JPEG, PNG, GIF, WebP. Si se proporciona oldImageUrl, eliminará automáticamente la imagen anterior.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen, carpeta opcional y URL de imagen anterior opcional para reemplazo',
    type: UploadFileWithReplaceDto,
  })
  
  @ApiResponse({
    status: 201,
    description: 'Archivo subido exitosamente (y imagen anterior eliminada si se proporcionó)',
    type: FileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Error en la validación del archivo o tipo no permitido',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Only image files are allowed' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor durante la subida',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('oldImageUrl') oldImageUrl?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    try {
      const result = oldImageUrl 
        ? await this.filesService.uploadImageAndReplaceOld(file, folder, oldImageUrl)
        : await this.filesService.uploadImage(file, folder);
      
      const message = oldImageUrl 
        ? 'File uploaded successfully and old image removed'
        : 'File uploaded successfully';

      return {
        message,
        url: result.secure_url,
        publicId: result.public_id,
        optimizedUrl: this.filesService.getOptimizedUrl(result.public_id),
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  @Post('upload-from-url')
  @ApiOperation({
    summary: 'Subir imagen desde URL',
    description: 'Permite subir una imagen directamente desde una URL externa'
  })
  @ApiBody({
    description: 'URL de la imagen y ID público opcional',
    type: UploadFromUrlDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente desde URL',
    type: FileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'URL requerida o inválida',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Image URL is required' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async uploadFromUrl(
    @Body('imageUrl') imageUrl: string,
    @Body('publicId') publicId?: string,
  ) {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    try {
      const result = await this.filesService.uploadImageFromUrl(imageUrl, publicId);
      return {
        message: 'Image uploaded successfully from URL',
        url: result.secure_url,
        publicId: result.public_id,
        optimizedUrl: this.filesService.getOptimizedUrl(result.public_id),
      };
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  @Get('optimized/:publicId')
  @ApiOperation({
    summary: 'Obtener URL optimizada',
    description: 'Obtiene una URL optimizada de una imagen existente con formato y calidad automáticos'
  })
  @ApiParam({
    name: 'publicId',
    description: 'ID público de la imagen en Cloudinary',
    example: 'todolist/sample_abc123'
  })
  @ApiResponse({
    status: 200,
    description: 'URL optimizada obtenida exitosamente',
    type: OptimizedUrlResponseDto,
  })
  getOptimizedUrl(@Param('publicId') publicId: string) {
    return {
      optimizedUrl: this.filesService.getOptimizedUrl(publicId),
    };
  }

  @Get('transformed/:publicId/:width/:height')
  @ApiOperation({
    summary: 'Obtener URL transformada con dimensiones',
    description: 'Obtiene una URL de imagen transformada con ancho y alto específicos'
  })
  @ApiParam({
    name: 'publicId',
    description: 'ID público de la imagen en Cloudinary',
    example: 'todolist/sample_abc123'
  })
  @ApiParam({
    name: 'width',
    description: 'Ancho deseado en píxeles',
    example: '300'
  })
  @ApiParam({
    name: 'height',
    description: 'Alto deseado en píxeles',
    example: '200'
  })
  @ApiResponse({
    status: 200,
    description: 'URL transformada obtenida exitosamente',
    type: TransformedUrlResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dimensiones inválidas',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Width and height must be valid numbers' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  getTransformedUrl(
    @Param('publicId') publicId: string,
    @Param('width') width: string,
    @Param('height') height: string,
  ) {
    const w = parseInt(width);
    const h = parseInt(height);
    
    if (isNaN(w) || isNaN(h)) {
      throw new BadRequestException('Width and height must be valid numbers');
    }

    return {
      transformedUrl: this.filesService.getTransformedUrl(publicId, w, h),
    };
  }

  @Delete(':publicId')
  @ApiOperation({
    summary: 'Eliminar imagen',
    description: 'Elimina una imagen del servidor usando su ID público'
  })
  @ApiParam({
    name: 'publicId',
    description: 'ID público de la imagen a eliminar',
    example: 'todolist/sample_abc123'
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen eliminada exitosamente',
    type: DeleteFileResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Error al eliminar la imagen',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Delete failed: Image not found' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async deleteImage(@Param('publicId') publicId: string) {
    try {
      const result = await this.filesService.deleteImage(publicId);
      return {
        message: 'Image deleted successfully',
        result,
      };
    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }
}
