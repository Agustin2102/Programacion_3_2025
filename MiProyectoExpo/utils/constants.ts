export const NOTIFICATION_INTERVAL_MS = 2*60*60*1000; // <-- Notificación para tomar foto cada 2 hors
export const CAPTURE_WINDOWS_MS = 30*1000; // <-- Tiempo para tomar la foto: 30 segundos

export type LocationData = {
    latitude: number;
    longitude: number;
    address?: string; // Dirección legible (opcional)
};

export type DualPhoto = {
    /**
     * @property {string} backPhoto.uri - La ruta de la foto de la cámara trasera
     * @property {string} frontPhoto.uri - La ruta de la foto de la cámara frontal
     * @property {number} timestamp - La marca de tiempo de la foto
     * @property {LocationData} location - La ubicación donde se tomó la foto
    */
   
    backPhoto: {uri: string};
    frontPhoto: {uri: string};
    timestamp: number;
    location?: LocationData; // Ubicación GPS (opcional para compatibilidad)
};

/**
 * Enum para las rutas de las pantallas
 */
export enum ViewRoute{
    Home = 'home',
    Camera = 'camera',
    Gallery = 'gallery',
}