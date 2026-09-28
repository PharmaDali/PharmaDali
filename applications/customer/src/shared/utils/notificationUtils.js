import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
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
 * Requests notification permissions and returns either the Native FCM Device Token or Expo Push Token.
 * Supports Development Builds, Expo Go, and standalone production binaries.
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
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  // 1. Try Native Device Push Token (Direct FCM Token) first for direct Firebase delivery
  try {
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    if (deviceToken?.data) {
      const rawToken = typeof deviceToken.data === 'string'
        ? deviceToken.data
        : deviceToken.data?.token || null;
      if (rawToken) {
        console.log('[Push] Obtained Native Device Push Token (FCM):', rawToken);
        return rawToken;
      }
    }
  } catch (deviceErr) {
    console.warn('[Push] Native device push token fetch failed, attempting Expo push token:', deviceErr);
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    '9dc21ec8-6add-4b56-a96a-85d7d3fddfa3';

  // 2. Fallback to Expo Push Token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    if (tokenData?.data) {
      console.log('[Push] Obtained Expo Push Token:', tokenData.data);
      return tokenData.data;
    }
  } catch (expoErr) {
    console.error('[Push] Error getting Expo push token:', expoErr);
  }

  return null;
}

/**
 * Registers for push notifications and syncs the token to the Laravel backend.
 * Safe to call multiple times — fails silently on error.
 */
export async function syncFcmTokenWithBackend() {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) {
      console.warn('[Push] Could not retrieve push token.');
      return;
    }
    await updateFcmToken(token);
    console.log('[Push] FCM token synced with backend successfully:', token);
  } catch (err) {
    console.error('[Push] Failed to sync token with backend:', err);
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

/**
 * Parses a location string into primary address and landmark note.
 * Handles production multi-line formats like:
 * "Pob. 3, Tanauan City, Batangas\n\nAcross the street, near Healthway DMMC."
 */
export function parsePharmacyLocation(locationString) {
  if (!locationString || typeof locationString !== 'string') {
    return { address: '', landmark: '' };
  }

  const lines = locationString
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { address: '', landmark: '' };
  }

  const address = lines[0];
  const landmark = lines.slice(1).join(' • ');

  return { address, landmark };
}

/**
 * Formats and extracts the clean branch name.
 */
export function formatBranchName(pharmacyName, location) {
  if (!pharmacyName && !location) return '';
  const raw = String(pharmacyName || '').trim();

  let cleaned = raw
    .replace(/^\(?pharma\s*dali\)?\s*[-–—:\/]*\s*/i, '')
    .replace(/\s*[-–—:\/]*\s*\(?pharma\s*dali\)?$/i, '')
    .replace(/^[-–—:\/\s]+|[-–—:\/\s]+$/g, '')
    .trim();

  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = cleaned.slice(1, -1).trim();
  } else if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  if (!cleaned || /^pharma\s*dali$/i.test(cleaned)) {
    if (location && String(location).trim()) {
      const firstLine = String(location).split(/\r?\n/)[0].trim();
      return firstLine || raw || '';
    }
    return raw || '';
  }

  return cleaned;
}

