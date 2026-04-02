import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TIMEOUT = 15000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const normalizeError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || "Request failed",
      data: error.response.data,
    };
  }

  if (error.request) {
    return {
      status: 0,
      message: "No response from server",
      data: null,
    };
  }

  return {
    status: 0,
    message: error.message || "Unexpected error",
    data: null,
  };
};

const request = async (config) => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem("token");
    delete apiClient.defaults.headers.common.Authorization;
    return;
  }

  localStorage.setItem("token", token);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const apiRequest = {
  get: (url, config = {}) => request({ method: "GET", url, ...config }),
  post: (url, data = {}, config = {}) => request({ method: "POST", url, data, ...config }),
  put: (url, data = {}, config = {}) => request({ method: "PUT", url, data, ...config }),
  patch: (url, data = {}, config = {}) => request({ method: "PATCH", url, data, ...config }),
  delete: (url, config = {}) => request({ method: "DELETE", url, ...config }),
};

export default apiClient;
