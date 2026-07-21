import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { updateFcmToken, removeFcmToken } from '@shared/services/notificationService';

/**
 * Configures how notifications are presented when the app is in the foreground.
 * Must be called before any notification interaction.
 */
export function configureForegroundNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Requests notification permissions and returns the Expo Push Token.
 * Returns null if permissions are denied or the device is a simulator.
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn('[Push] Must use a physical device for push notifications.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission not granted for push notifications.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'PharmaDali',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#48AAD9',
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

/**
 * Registers for push notifications and syncs the token to the Laravel backend.
 * Safe to call multiple times — fails silently on error.
 */
export async function syncFcmTokenWithBackend() {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return;
    await updateFcmToken(token);
    console.log('[Push] Token synced with backend:', token);
  } catch (err) {
    console.error('[Push] Failed to sync token:', err);
  }
}

/**
 * Removes the FCM token from the backend (call on logout).
 */
export async function removeFcmTokenFromBackend() {
  try {
    await removeFcmToken();
    console.log('[Push] Token removed from backend.');
  } catch (err) {
    console.error('[Push] Failed to remove token:', err);
  }
}

