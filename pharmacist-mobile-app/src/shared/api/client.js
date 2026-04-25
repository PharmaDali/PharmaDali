import * as SecureStore from 'expo-secure-store';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const getBaseUrl = () => (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '');

const getErrorMessage = (data, fallback) => {
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return data?.message?.trim() || fallback;
};

const getStoredToken = async () => {
  const raw = await SecureStore.getItemAsync('pharmacist_token');

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

  const baseHeaders = {
    Accept: 'application/json',
    ...authHeader,
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
    throw new ApiError(getErrorMessage(data, 'Request failed.'), response.status, data);
  }

  return data;
}

export { ApiError };
