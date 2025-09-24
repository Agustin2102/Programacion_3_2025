import * as Location from 'expo-location';
import { LocationData } from '../utils/constants';

export class LocationService {
  private static hasPermission: boolean = false;

  /**
   * Solicita permisos de ubicación
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Obtiene la ubicación actual
   */
  static async getCurrentLocation(): Promise<LocationData | null> {
    try {
      if (!this.hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          console.log('Location permission denied');
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Intentar obtener la dirección (opcional)
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (address && address.length > 0) {
          const addr = address[0];
          locationData.address = `${addr.street || ''} ${addr.city || ''}, ${addr.region || ''} ${addr.country || ''}`.trim();
        }
      } catch (addressError) {
        console.log('Could not get address:', addressError);
      }

      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Verifica si tenemos permisos de ubicación
   */
  static async hasLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  /**
   * Formatea una ubicación para mostrar
   */
  static formatLocation(location: LocationData): string {
    if (location.address) {
      return location.address;
    }
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }
}