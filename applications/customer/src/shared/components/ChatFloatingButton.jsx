import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCustomerConversations } from '@shared/services/chatService';

export default function ChatFloatingButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const lastCheckRef = useRef(0);

  const checkUnread = useCallback(() => {
    const now = Date.now();
    if (now - lastCheckRef.current < 10000) {
      return;
    }
    lastCheckRef.current = now;

    let isMounted = true;
    getCustomerConversations()
      .then((result) => {
        if (!isMounted) return;
        const validConversations = (Array.isArray(result) ? result : []).filter((c) => {
          const orderStatus = String(c?.order?.status || '').toLowerCase();
          const convStatus = String(c?.status || '').toLowerCase();
          return (
            c.latest_message !== null &&
            orderStatus !== 'completed' &&
            orderStatus !== 'cancelled' &&
            orderStatus !== 'rejected' &&
            convStatus !== 'closed'
          );
        });
        const hasUnread = validConversations.some((c) => (Number(c?.unread_count) || 0) > 0);
        setHasUnreadMessage(hasUnread);
      })
      .catch(() => {
        if (isMounted) setHasUnreadMessage(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [pathname, checkUnread]);

  const handlePress = () => {
    setHasUnreadMessage(false);
    router.push('/tabs/chat/Chat');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.floatingButton}
      accessibilityRole="button"
      accessibilityLabel="Open Chat with Pharmacist"
    >
      <MaterialCommunityIcons name="message-text-outline" size={26} color="#FFFFFF" />
      {hasUnreadMessage && <View style={styles.unreadBadge} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 999,
  },
  unreadBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
});
