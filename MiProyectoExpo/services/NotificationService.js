import * as Notifications from 'expo-notifications';
import {NOTIFICATION_INTERVAL_MS} from '../utils/constants';

export class NotificationService{

    // Fúncion para solicitar permisos de notificaciones
    static async requestPermissions(){
        /**
         * @returns {Promise<boolean>} - True si se han concedido los permisos, false en caso contrario
         */
        const{status} = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    }

    // Fúncion para programar una notificación
    static async scheduleIn(intervalMs = NOTIFICATION_INTERVAL_MS){
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '¡Es hora de tu foto! 📸',
                body: 'Tienes 30 segundos para tomarla',
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {seconds: Math.floor(intervalMs/1000)},
        });
    }

    // Fúncion para escuchar las notificaciones
    static listen(onRecive){
        return Notifications.addNotificationReceivedListener(onRecive);
    }

    // Fúncion para cancelar todas las notificaciones
    static async cancelAll(){
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

}

// Fúncion para configurar el handler de las notificaciones
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlayAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,

    }),
});