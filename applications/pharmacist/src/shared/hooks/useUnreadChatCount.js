import { useState, useEffect, useCallback } from 'react';
import { getPharmacistConversations } from '@shared/services/chatService';

export function useUnreadChatCount() {
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchUnreadChatCount = useCallback(async () => {
    try {
      const conversations = await getPharmacistConversations();
      const totalUnread = (Array.isArray(conversations) ? conversations : []).reduce((acc, c) => {
        const orderStatus = String(c?.order?.status || '').toLowerCase();
        const convStatus = String(c?.status || '').toLowerCase();
        if (
          orderStatus !== 'completed' &&
          orderStatus !== 'cancelled' &&
          orderStatus !== 'rejected' &&
          convStatus !== 'closed'
        ) {
          return acc + (c.unread_count || 0);
        }
        return acc;
      }, 0);
      setUnreadChatCount(totalUnread);
    } catch {
      setUnreadChatCount(0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadChatCount();
    const interval = setInterval(fetchUnreadChatCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadChatCount]);

  return { unreadChatCount, refetch: fetchUnreadChatCount };
}
