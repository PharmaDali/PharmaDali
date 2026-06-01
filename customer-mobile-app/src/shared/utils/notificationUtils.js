import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { updateFcmToken } from '../services/notificationService';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get the FCM token directly
    token = (await Notifications.getDevicePushTokenAsync()).data;
    
    // Alternatively, use Expo token if you are using Expo Push Services, 
    // but here we are using FCM on the backend directly.
    // However, expo-notifications getDevicePushTokenAsync returns the native token (FCM for Android, APNs for iOS)
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function syncFcmTokenWithBackend() {
    const token = await registerForPushNotificationsAsync();
    if (token) {
        try {
            await updateFcmToken(token);
            console.log('FCM Token synced with backend');
        } catch (error) {
            console.error('Failed to sync FCM token with backend:', error);
        }
    }
}
