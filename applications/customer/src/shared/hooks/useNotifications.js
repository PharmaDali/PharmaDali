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
    if (!date) return 'Recently';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Recently';

    const seconds = Math.floor((new Date() - parsedDate) / 1000);
    if (seconds < 10) return 'Just now';

    let interval = seconds / 31536000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' year ago' : ' years ago');
    interval = seconds / 2592000;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' month ago' : ' months ago');
    interval = seconds / 86400;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' day ago' : ' days ago');
    interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' hour ago' : ' hours ago');
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? ' minute ago' : ' minutes ago');
    return Math.floor(seconds) + ' seconds ago';
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
