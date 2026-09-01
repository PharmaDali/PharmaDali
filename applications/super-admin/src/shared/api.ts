import axios from 'axios';

// Create a reusable Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Optionally handle 401 Unauthorized globally here
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      // window.location.href = '/login'; // Or navigate using your router
    }
    return Promise.reject(error);
  }
);

export default api;

