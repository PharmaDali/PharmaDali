import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

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

const getStoredToken = async () => {
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

const handleUnauthorized = async () => {
  await clearAuthStorage();
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
    if (response.status === 401 && authToken && !path.includes('/login')) {
      await handleUnauthorized();
    }
    throw new ApiError(getErrorMessage(data, 'Request failed.'), response.status, data);
  }

  return data;
}

export { ApiError };
