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
    // Handle 401 Unauthorized or 403 Forbidden globally by clearing token and redirecting to login
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isDeactivated = error.response.data?.message?.toLowerCase().includes('deactivated');
      const deactivationMsg = error.response.data?.message || 'Your account has been deactivated. Please contact support.';

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('tokenExpiry');

      if (isDeactivated) {
        sessionStorage.setItem('superadmin_account_deactivated_notice', deactivationMsg);
      }

      if (window.location.pathname !== '/') {
        window.location.href = isDeactivated ? '/?deactivated=1' : '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
