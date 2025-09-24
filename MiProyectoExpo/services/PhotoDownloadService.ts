import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export class PhotoDownloadService {
  
  /**
   * Comparte una foto usando el sistema de compartir nativo
   * Esto permite al usuario guardarlo en galería, enviar por WhatsApp, etc.
   */
  static async sharePhoto(uri: string, title: string = 'Guardar foto') {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'El sistema de compartir no está disponible');
        return false;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: title,
      });
      
      return true;
    } catch (error) {
      console.error('Error sharing photo:', error);
      Alert.alert('Error', 'No se pudo compartir la foto');
      return false;
    }
  }

  /**
   * Función simplificada que directamente comparte la foto
   */
  static async downloadPhoto(uri: string, filename: string) {
    try {
      const success = await this.sharePhoto(uri, `Guardar: ${filename}`);
      if (success) {
        Alert.alert(
          '✅ Éxito', 
          'Usa la opción "Guardar en fotos" o similar para almacenar la imagen en tu galería',
          [{ text: 'OK' }]
        );
      }
      return success;
    } catch (error) {
      console.error('Error downloading photo:', error);
      Alert.alert('Error', 'No se pudo preparar la foto');
      return false;
    }
  }
}