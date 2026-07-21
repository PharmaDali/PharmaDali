import { useState, useEffect } from 'react';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@shared/services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => notif.id === id ? { ...notif, read_at: new Date() } : notif)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date() }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return { 
    notifications, 
    loading, 
    error, 
    refetch: getNotifications, 
    markAsRead, 
    markAllRead,
    timeAgo
  };
}
