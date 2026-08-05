import { useState, useEffect } from 'react';
import { fetchUnreadNotifications } from '@shared/services/notificationService';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const getUnreadCount = async () => {
    try {
      const unread = await fetchUnreadNotifications();
      setUnreadCount(unread.length);
    } catch (err) {
      console.error('Failed to fetch unread notifications:', err);
    }
  };

  useEffect(() => {
    getUnreadCount();
    
    // Check every 30 seconds
    const interval = setInterval(getUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { unreadCount, refetch: getUnreadCount };
}
