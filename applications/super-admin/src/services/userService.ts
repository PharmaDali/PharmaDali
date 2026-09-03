import api from '../shared/api';

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (payload: any) => {
  const response = await api.post('/users', payload);
  return response.data;
};

export const updateUser = async (id: number | string, payload: any) => {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number | string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
