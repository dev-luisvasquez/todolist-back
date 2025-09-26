# Gestión de Archivos con Eliminación Automática

Este documento explica cómo usar la funcionalidad mejorada del servicio de archivos que permite eliminar automáticamente la imagen anterior al subir una nueva.

## Funcionalidades Añadidas

### 1. Función `uploadImage` Mejorada

La función `uploadImage` ahora acepta un parámetro opcional `oldPublicId` para eliminar automáticamente la imagen anterior:

```typescript
async uploadImage(file: Express.Multer.File, folder?: string, oldPublicId?: string): Promise<any>
```

**Parámetros:**
- `file`: Archivo de imagen de Express.Multer
- `folder`: Carpeta opcional donde almacenar el archivo
- `oldPublicId`: Public ID de la imagen anterior a eliminar (opcional)

### 2. Función `uploadImageAndReplaceOld`

Nueva función que simplifica el proceso al trabajar con URLs completas:

```typescript
async uploadImageAndReplaceOld(file: Express.Multer.File, folder?: string, oldImageUrl?: string): Promise<any>
```

**Parámetros:**
- `file`: Archivo de imagen de Express.Multer
- `folder`: Carpeta opcional donde almacenar el archivo
- `oldImageUrl`: URL completa de la imagen anterior a eliminar (opcional)

### 3. Función `extractPublicIdFromUrl`

Extrae el public ID de una URL de Cloudinary:

```typescript
extractPublicIdFromUrl(url: string): string | null
```

## Nuevos Endpoints

### POST `/files/upload-replace`

Nuevo endpoint para subir una imagen y eliminar la anterior automáticamente.

**Parámetros del formulario:**
- `file`: Archivo de imagen (requerido)
- `folder`: Carpeta de destino (opcional)
- `oldImageUrl`: URL de la imagen anterior a eliminar (opcional)

**Respuesta:**
```json
{
  "message": "File uploaded successfully and old image removed",
  "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/new-image.jpg",
  "publicId": "folder/new-image",
  "optimizedUrl": "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1234567890/new-image.jpg"
}
```

## Ejemplo de Uso en Controladores

### Actualización de Avatar de Usuario

```typescript
@Put('profile/avatar')
@UseGuards(AuthGuard)
@UseInterceptors(FileInterceptor('file'))
async updateUserAvatar(
    @Request() req: any, 
    @UploadedFile() file: Express.Multer.File
) {
    const userId = req.user.id;
    
    // Obtener el usuario actual para obtener el avatar anterior
    const currentUser = await this.usersService.getUserById(userId);
    const oldAvatarUrl = currentUser?.avatar;

    // Subir nueva imagen y eliminar la anterior
    const uploadResult = await this.filesService.uploadImageAndReplaceOld(
        file, 
        'todolist/avatars', 
        oldAvatarUrl && oldAvatarUrl !== 'URL_AVATAR_POR_DEFECTO' 
            ? oldAvatarUrl 
            : undefined // No eliminar el avatar por defecto
    );

    // Actualizar el usuario con la nueva URL del avatar
    return this.usersService.updatedUserById(userId, {
        avatar: uploadResult.secure_url
    });
}
```

## Consideraciones Importantes

1. **Avatar por defecto**: La función verifica si la imagen anterior es el avatar por defecto del sistema y no la elimina en ese caso.

2. **Manejo de errores**: Si no se puede eliminar la imagen anterior, el sistema registra una advertencia pero continúa con la subida de la nueva imagen.

3. **Seguridad**: La función extrae automáticamente el publicId de URLs de Cloudinary válidas, ignorando URLs que no sean de Cloudinary.

4. **Tipos de archivos soportados**: JPEG, PNG, GIF, WebP

## Flujo de Trabajo

1. Se recibe el archivo nuevo y opcionalmente la URL de la imagen anterior
2. Si existe una URL anterior, se extrae el publicId usando `extractPublicIdFromUrl`
3. Se intenta eliminar la imagen anterior (si el publicId es válido)
4. Se sube la nueva imagen
5. Se retorna la información de la nueva imagen subida

Esta implementación asegura que no se acumulen imágenes innecesarias en Cloudinary y optimiza el uso del storage.
