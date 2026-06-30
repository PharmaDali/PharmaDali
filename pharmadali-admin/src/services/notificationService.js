import { apiRequest } from "../shared/api/apiClient";

export const fetchNotifications = async (page = 1) => {
  return await apiRequest.get(`/notifications?page=${page}`);
};

export const fetchUnreadNotifications = async () => {
  return await apiRequest.get("/notifications/unread");
};

export const markNotificationAsRead = async (id) => {
  return await apiRequest.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await apiRequest.post("/notifications/read-all");
};

export const deleteNotification = async (id) => {
  return await apiRequest.delete(`/notifications/${id}`);
};
