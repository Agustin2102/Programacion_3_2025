import * as Notifications from 'expo-notifications';
import { NOTIFICATION_INTERVAL_MS } from '../utils/constants';

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static listen(onReceive: () => void) {
    return Notifications.addNotificationReceivedListener(onReceive);
  }

  static async scheduleIn(intervalMs: number = NOTIFICATION_INTERVAL_MS) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '¡Es hora de tu foto! 📸',
        body: 'Tienes 30 segundos para tomarla',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.floor(intervalMs / 1000) 
      },
    });
  }

  static async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Configuración de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
