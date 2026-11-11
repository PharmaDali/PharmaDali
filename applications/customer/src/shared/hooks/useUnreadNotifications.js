import { useState, useEffect, useCallback } from 'react';
import { fetchUnreadNotifications } from '@shared/services/notificationService';

// Module-level shared state so every consumer (and remounts) stay in sync.
// Notifications stay unread on the server; the badge only hides the ones the
// user has already "seen" by opening the Notifications tab (optimistic UI).
let latestUnreadIds = [];
const seenIds = new Set();
let badgeCount = 0;
const listeners = new Set();

const recompute = () => {
  badgeCount = latestUnreadIds.filter((id) => !seenIds.has(id)).length;
  listeners.forEach((listener) => {
    try {
      listener(badgeCount);
    } catch {}
  });
};

export const markUnreadAsSeen = () => {
  latestUnreadIds.forEach((id) => seenIds.add(id));
  recompute();
};

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(badgeCount);

  useEffect(() => {
    listeners.add(setUnreadCount);
    setUnreadCount(badgeCount);
    return () => {
      listeners.delete(setUnreadCount);
    };
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const unread = await fetchUnreadNotifications();
      latestUnreadIds = (Array.isArray(unread) ? unread : []).map((n) => n.id);
      const current = new Set(latestUnreadIds);
      seenIds.forEach((id) => {
        if (!current.has(id)) seenIds.delete(id);
      });
      recompute();
    } catch (err) {
      console.error('Failed to fetch unread notifications:', err);
    }
  }, []);

  useEffect(() => {
    getUnreadCount();
    const interval = setInterval(getUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [getUnreadCount]);

  return { unreadCount, refetch: getUnreadCount, markSeen: markUnreadAsSeen };
}
