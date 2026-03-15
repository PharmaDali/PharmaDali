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

export async function apiRequest(path, options = {}) {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new ApiError('EXPO_PUBLIC_API_URL is not set in .env', 0, null);
  }

  const { method = 'GET', body, headers = {} } = options;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Request failed.'), response.status, data);
  }

  return data;
}

export { ApiError };