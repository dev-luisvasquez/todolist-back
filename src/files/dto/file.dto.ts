import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo de imagen a subir',
    example: 'imagen.jpg'
  })
  file: any;

  @ApiPropertyOptional({
    description: 'Carpeta donde se almacenará el archivo',
    example: 'todolist/avatars'
  })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class UploadFileWithReplaceDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo de imagen a subir',
    example: 'imagen.jpg'
  })
  file: any;

  @ApiPropertyOptional({
    description: 'Carpeta donde se almacenará el archivo',
    example: 'todolist/avatars'
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen anterior a eliminar',
    example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/old-image.jpg'
  })
  @IsOptional()
  @IsString()
  oldImageUrl?: string;
}

export class UploadFromUrlDto {
  @ApiProperty({
    description: 'URL de la imagen a subir',
    example: 'https://example.com/image.jpg'
  })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'ID público personalizado para la imagen',
    example: 'mi-imagen-personalizada'
  })
  @IsOptional()
  @IsString()
  publicId?: string;
}

export class FileResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'File uploaded successfully'
  })
  message: string;

  @ApiProperty({
    description: 'URL segura de la imagen subida',
    example: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg'
  })
  url: string;

  @ApiProperty({
    description: 'ID público de la imagen en Cloudinary',
    example: 'todolist/sample_abc123'
  })
  publicId: string;

  @ApiProperty({
    description: 'URL optimizada de la imagen',
    example: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg'
  })
  optimizedUrl: string;
}

export class OptimizedUrlResponseDto {
  @ApiProperty({
    description: 'URL optimizada de la imagen',
    example: 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/sample.jpg'
  })
  optimizedUrl: string;
}

export class TransformedUrlResponseDto {
  @ApiProperty({
    description: 'URL transformada de la imagen con dimensiones específicas',
    example: 'https://res.cloudinary.com/demo/image/upload/c_auto,g_auto,w_300,h_200/sample.jpg'
  })
  transformedUrl: string;
}

export class DeleteFileResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Image deleted successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Resultado de la operación de eliminación',
    example: { result: 'ok' }
  })
  result: any;
}
