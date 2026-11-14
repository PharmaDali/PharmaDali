import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { triggerAccountDeactivatedModal } from '@shared/components/AccountDeactivatedModal';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const PROD_API_URL = 'https://api.pharmadali.com/api';

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');
  return PROD_API_URL;
};

const getErrorMessage = (data, fallback) => {
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return data?.message?.trim() || fallback;
};

const getItem = async (key) => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

let cachedToken = null;

// Synchronous access to the last-known token (used for authenticated image requests).
export const getCachedToken = () => cachedToken;

const readStoredToken = async () => {
  const raw = await getItem('pharmacist_token');

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === 'string') {
      return parsed;
    }

    if (parsed?.token) {
      return parsed.token;
    }

    return null;
  } catch {
    return raw;
  }
};

export const getStoredToken = async () => {
  const token = await readStoredToken();
  cachedToken = token;
  return token;
};

const getStoredPharmacyId = async () => {
  const raw = await getItem('pharmacist_token');

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.user?.pharmacy_id) {
      return String(parsed.user.pharmacy_id);
    }
    return null;
  } catch {
    return null;
  }
};

let isRedirectingToLogin = false;

const clearAuthStorage = async () => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem('pharmacist_token');
    } catch {}
  } else {
    try {
      await SecureStore.deleteItemAsync('pharmacist_token');
    } catch {}
  }
};

export const isAccountDeactivated = (data, message) => {
  if (data?.deactivated === true) {
    return true;
  }
  const text = String(message || data?.message || '').toLowerCase();
  return text.includes('deactivated');
};

const handleUnauthorized = async (message, data) => {
  await clearAuthStorage();
  if (isAccountDeactivated(data, message)) {
    triggerAccountDeactivatedModal(
      message || 'Your pharmacist account has been deactivated. Please contact your pharmacy administrator.'
    );
  }
  if (!isRedirectingToLogin) {
    isRedirectingToLogin = true;
    try {
      router.replace('/auth/PharmacistLogin');
    } catch (err) {
      console.warn('[Pharmacist API] Navigation to login failed:', err);
    } finally {
      setTimeout(() => {
        isRedirectingToLogin = false;
      }, 1500);
    }
  }
};

export async function apiRequest(path, options = {}) {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new ApiError('EXPO_PUBLIC_API_URL is not set in .env', 0, null);
  }

  const { method = 'GET', body, headers = {} } = options;
  const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData;
  const authToken = await getStoredToken();
  const hasAuthorizationHeader = Object.keys(headers).some((key) => key.toLowerCase() === 'authorization');

  const authHeader = authToken && !hasAuthorizationHeader
    ? { Authorization: `Bearer ${authToken}` }
    : {};

  const pharmacyId = await getStoredPharmacyId();
  const pharmacyHeader = pharmacyId ? { 'X-Pharmacy-ID': pharmacyId } : {};

  const baseHeaders = {
    Accept: 'application/json',
    ...authHeader,
    ...pharmacyHeader,
    ...headers,
  };

  if (!isFormDataBody) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: baseHeaders,
    body: body
      ? (isFormDataBody ? body : JSON.stringify(body))
      : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = getErrorMessage(data, 'Request failed.');
    const isDeactivated = isAccountDeactivated(data, errorMessage);
    const isAuthLifecycleRoute =
      path.includes('/login') ||
      path.includes('/logout') ||
      path.includes('/fcm-token');

    if (
      authToken &&
      !isAuthLifecycleRoute &&
      (response.status === 401 || (response.status === 403 && isDeactivated))
    ) {
      const currentToken = await getStoredToken();
      if (currentToken && currentToken === authToken) {
        await handleUnauthorized(errorMessage, data);
      }
    }
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export { ApiError };
