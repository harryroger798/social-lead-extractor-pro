import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'TextShift',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: 'f3984ec6-f3e3-4058-ad07-cee726b6aca2',
  });

  await AsyncStorage.setItem('push_token', tokenData.data);
  return tokenData.data;
}

export async function getPushToken(): Promise<string | null> {
  return AsyncStorage.getItem('push_token');
}

export async function sendLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: 'default',
    },
    trigger: null,
  });
}

export async function scheduleScanCompleteNotification(scanType: string) {
  const typeLabels: Record<string, string> = {
    ai_detection: 'AI Detection',
    humanize: 'Humanization',
    plagiarism: 'Plagiarism Check',
  };
  const label = typeLabels[scanType] || scanType;
  await sendLocalNotification(
    'Scan Complete',
    `Your ${label} scan has finished processing.`,
    { type: 'scan_complete', scan_type: scanType }
  );
}

export async function scheduleCreditLowNotification(balance: number) {
  if (balance <= 10 && balance > 0) {
    const lastNotified = await AsyncStorage.getItem('credit_low_notified');
    const now = Date.now();
    if (!lastNotified || now - Number(lastNotified) > 86400000) {
      await sendLocalNotification(
        'Low Credits',
        `You have ${balance} credits remaining. Upgrade your plan for more.`,
        { type: 'credit_low' }
      );
      await AsyncStorage.setItem('credit_low_notified', String(now));
    }
  }
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}
