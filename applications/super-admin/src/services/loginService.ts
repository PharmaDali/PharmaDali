import api from '../shared/api';

export const login = async (credentials: any) => {
  try {
    const response = await api.post('/admin/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An error occurred during login. Please try again.');
  }
};
