import { apiRequest } from '@shared/api/client';

export async function fetchNotifications() {
  const payload = await apiRequest('/notifications', {
    method: 'GET',
  });

  if (payload?.status === 'success' && payload?.data?.data) {
    return payload.data.data;
  }

  return [];
}

export async function fetchUnreadNotifications() {
  const payload = await apiRequest('/notifications/unread', {
    method: 'GET',
  });

  if (payload?.status === 'success' && payload?.data) {
    return payload.data;
  }

  return [];
}

export async function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsAsRead() {
  return apiRequest('/notifications/read-all', {
    method: 'POST',
  });
}

export async function deleteNotification(id) {
  return apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  });
}
