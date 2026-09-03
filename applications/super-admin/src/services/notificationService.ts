import api from '../shared/api';

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get('/notifications/unread');
  return response.data;
};

export const markNotificationAsRead = async (id: string | number) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id: string | number) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await api.delete('/notifications/delete-all');
  return response.data;
};

