import api from '../shared/api';

export const login = async (credentials: any) => {
  try {
    const response = await api.post('/admin/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An error occurred during login. Please try again.');
  }
};

export const logout = async () => {
  try {
    await api.post('/logout');
  } catch (err) {
    console.error('Logout request failed:', err);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('tokenExpiry');
  }
};
