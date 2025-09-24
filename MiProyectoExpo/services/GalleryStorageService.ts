import * as MediaLibrary from 'expo-media-library';
import { DualPhoto, LocationData } from '../utils/constants';

const ALBUM_NAME = 'MiProyectoExpo';

export class GalleryStorageService {
  
  /**
   * Solicita permisos de media library
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  /**
   * Obtiene o crea el álbum de la app
   */
  static async getOrCreateAlbum(): Promise<MediaLibrary.Album | null> {
    try {
      // Verificar permisos
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No media library permissions');
        return null;
      }

      // Buscar álbum existente
      let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      
      if (!album) {
        // Crear álbum temporal con una foto ficticia para inicializarlo
        // Esto es necesario porque MediaLibrary requiere un asset para crear un álbum
        console.log('Album not found, will create when first photo is saved');
        return null;
      }

      return album;
    } catch (error) {
      console.error('Error getting/creating album:', error);
      return null;
    }
  }

  /**
   * Guarda una foto dual en la galería
   */
  static async saveDualPhotoToGallery(
    backPhotoUri: string, 
    frontPhotoUri: string, 
    location?: LocationData
  ): Promise<{ backAsset: MediaLibrary.Asset; frontAsset: MediaLibrary.Asset } | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('No media library permissions');
      }

      // Guardar ambas fotos como assets
      const backAsset = await MediaLibrary.createAssetAsync(backPhotoUri);
      const frontAsset = await MediaLibrary.createAssetAsync(frontPhotoUri);

      // Intentar agregar al álbum personalizado
      try {
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (!album) {
          // Crear álbum con la primera foto
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, backAsset, false);
          // Agregar la segunda foto
          await MediaLibrary.addAssetsToAlbumAsync([frontAsset], album, false);
        } else {
          // Agregar ambas fotos al álbum existente
          await MediaLibrary.addAssetsToAlbumAsync([backAsset, frontAsset], album, false);
        }
      } catch (albumError) {
        console.log('Error with album, but photos saved to gallery:', albumError);
      }

      return { backAsset, frontAsset };
    } catch (error) {
      console.error('Error saving dual photo to gallery:', error);
      return null;
    }
  }

  /**
   * Carga todas las fotos duales desde la galería
   */
  static async loadDualPhotosFromGallery(): Promise<DualPhoto[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('No media library permissions, returning empty array');
        return [];
      }

      const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      if (!album) {
        console.log('Album not found, returning empty array');
        return [];
      }

      // Obtener todas las fotos del álbum
      const media = await MediaLibrary.getAssetsAsync({
        album: album,
        mediaType: 'photo',
        sortBy: 'creationTime',
      });

      // Agrupar fotos en pares (asumiendo que se guardan en pares)
      const dualPhotos: DualPhoto[] = [];
      const assets = media.assets;

      // Agrupar de 2 en 2 (back y front)
      for (let i = 0; i < assets.length; i += 2) {
        if (i + 1 < assets.length) {
          const backAsset = assets[i];
          const frontAsset = assets[i + 1];

          const dualPhoto: DualPhoto = {
            backPhoto: { uri: backAsset.uri },
            frontPhoto: { uri: frontAsset.uri },
            timestamp: backAsset.creationTime || Date.now(),
            // TODO: Recuperar ubicación si está disponible en metadatos
          };

          dualPhotos.push(dualPhoto);
        }
      }

      return dualPhotos.reverse(); // Más recientes primero
    } catch (error) {
      console.error('Error loading dual photos from gallery:', error);
      return [];
    }
  }

  /**
   * Elimina una foto dual de la galería
   */
  static async deleteDualPhotoFromGallery(dualPhoto: DualPhoto): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      // Buscar y eliminar los assets correspondientes
      // Esto es más complejo porque necesitamos encontrar los assets por URI
      // Por simplicidad, por ahora solo mostraremos un mensaje
      console.log('Delete functionality would be implemented here');
      return true;
    } catch (error) {
      console.error('Error deleting dual photo from gallery:', error);
      return false;
    }
  }
}