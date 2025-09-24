import AsyncStorage from '@react-native-async-storage/async-storage';
import { DualPhoto } from '../utils/constants';

const PHOTOS_KEY = 'bereal_photos';

export class StorageService {
  static async getPhotos(): Promise<DualPhoto[]> {
    try {
      const raw = await AsyncStorage.getItem(PHOTOS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  }

  static async addPhoto(photo: DualPhoto) {
    try {
      const photos = await this.getPhotos();
      photos.push(photo);
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    } catch (error) {
      console.error('Error adding photo:', error);
    }
  }

  static async deletePhoto(timestamp: number) {
    try {
      const photos = await this.getPhotos();
      const updatedPhotos = photos.filter(photo => photo.timestamp !== timestamp);
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
      return updatedPhotos;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return await this.getPhotos(); // Return current photos on error
    }
  }

  static async clearAllPhotos() {
    try {
      await AsyncStorage.removeItem(PHOTOS_KEY);
    } catch (error) {
      console.error('Error clearing photos:', error);
    }
  }
}
