import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  console.log('Push notifications are currently disabled.');
  return null;
}

export async function syncFcmTokenWithBackend() {
    console.log('Push notification sync is currently disabled.');
}
