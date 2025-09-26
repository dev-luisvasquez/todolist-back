import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Servicio para gestión de archivos usando Cloudinary
 * Proporciona funcionalidades para subir, transformar y eliminar imágenes
 */
@Injectable()
export class FilesService {
  constructor() {
    // Configuración de Cloudinary con variables de entorno
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dybx8epyl',
      api_key: process.env.CLOUDINARY_API_KEY || '719932435495184',
      api_secret: process.env.CLOUDINARY_API_SECRET, // Variable requerida en .env
    });
  }

  /**
   * Sube una imagen desde un archivo multipart/form-data
   * @param file - Archivo de imagen de Express.Multer
   * @param folder - Carpeta opcional donde almacenar el archivo
   * @param oldPublicId - Public ID de la imagen anterior a eliminar (opcional)
   * @returns Resultado de la subida con URLs y metadata
   */

  async uploadImage(file: Express.Multer.File, folder?: string, oldPublicId?: string): Promise<any> {
    try {
      // Si se proporciona un oldPublicId, eliminar la imagen anterior primero
      if (oldPublicId) {
        try {
          await this.deleteImage(oldPublicId);
          console.log(`Imagen anterior eliminada: ${oldPublicId}`);
        } catch (error) {
          console.warn(`No se pudo eliminar la imagen anterior (${oldPublicId}):`, error.message);
          // Continúa con la subida aunque no se haya podido eliminar la anterior
        }
      }

      const uploadOptions: any = {
        resource_type: 'image',
        folder: folder || 'not-specified',
        timeout: 30000, // 30 segundos de timeout
      };

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error(`Error uploading image: ${error.message || error}`));
            } else {
              resolve(result);
            }
          }
        );
        
        // Manejar errores del stream
        uploadStream.on('error', (error) => {
          console.error('Upload stream error:', error);
          reject(new Error(`Stream error: ${error.message || error}`));
        });

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Upload method error:', error);
      throw new Error(`Error uploading image: ${error.message || error}`);
    }
  }

  /**
   * Sube una imagen desde una URL externa
   * @param imageUrl - URL de la imagen a subir
   * @param publicId - ID público personalizado opcional
   * @returns Resultado de la subida con URLs y metadata
   */
  async uploadImageFromUrl(imageUrl: string, publicId?: string): Promise<any> {
    try {
      const uploadResult = await cloudinary.uploader
        .upload(imageUrl, {
          public_id: publicId,
          folder: 'no-specified',
        })
        .catch((error) => {
          throw new Error(`Error uploading image from URL: ${error.message}`);
        });

      return uploadResult;
    } catch (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }

  /**
   * Genera una URL optimizada con formato y calidad automáticos
   * @param publicId - ID público de la imagen en Cloudinary
   * @returns URL optimizada
   */
  getOptimizedUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      fetch_format: 'auto',
      quality: 'auto',
    });
  }

  /**
   * Genera una URL transformada con dimensiones específicas
   * @param publicId - ID público de la imagen en Cloudinary
   * @param width - Ancho deseado en píxeles
   * @param height - Alto deseado en píxeles
   * @returns URL transformada con las dimensiones especificadas
   */
  getTransformedUrl(publicId: string, width: number, height: number): string {
    return cloudinary.url(publicId, {
      crop: 'auto',
      gravity: 'auto',
      width,
      height,
    });
  }

 
  async uploadImageAndReplaceOld(file: Express.Multer.File, folder?: string, oldImageUrl?: string): Promise<any> {
    let oldPublicId: string | undefined = undefined;

    // Si se proporciona una URL anterior, extraer el publicId
    if (oldImageUrl) {
      const extractedId = this.extractPublicIdFromUrl(oldImageUrl);
      oldPublicId = extractedId || undefined;
    }

    // Usar la función uploadImage con el publicId extraído
    return await this.uploadImage(file, folder, oldPublicId);
  }

  /**
   * Extrae el public ID de una URL de Cloudinary
   * @param url - URL completa de Cloudinary
   * @returns Public ID extraído o null si no se puede extraer
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      if (!url || !url.includes('cloudinary.com')) {
        return null;
      }

      // Patrón para extraer el public_id de URLs de Cloudinary
      // Formato típico: https://res.cloudinary.com/cloud_name/image/upload/version/folder/public_id.extension
      const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
      const match = url.match(regex);
      
      if (match && match[1]) {
        return match[1];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return null;
    }
  }

  /**
   * Elimina una imagen del servidor de Cloudinary
   * @param publicId - ID público de la imagen a eliminar
   * @returns Resultado de la operación de eliminación
   */
  async deleteImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Error deleting image: ${error.message}`);
    }
  }
}
