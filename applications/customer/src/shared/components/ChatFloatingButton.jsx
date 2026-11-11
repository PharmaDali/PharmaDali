import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, AppState, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getCustomerConversations } from '@shared/services/chatService';

export default function ChatFloatingButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const lastCheckRef = useRef(0);

  const checkUnread = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastCheckRef.current < 5000) {
      return;
    }
    lastCheckRef.current = now;

    let isMounted = true;
    getCustomerConversations()
      .then((result) => {
        if (!isMounted) return;
        const list = Array.isArray(result) ? result : (Array.isArray(result?.data) ? result.data : []);
        const hasUnread = list.some((c) => {
          const unreadCount = Number(c?.unread_count);
          if (Number.isFinite(unreadCount) && unreadCount > 0) {
            return true;
          }
          if (c?.latest_message && !c.latest_message.read_at) {
            const senderId = c.latest_message.sender_user_id;
            const customerId = c.customer_user_id;
            if (senderId === null || (customerId && senderId !== customerId)) {
              return true;
            }
          }
          return false;
        });
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
    checkUnread(true);
    const interval = setInterval(() => checkUnread(false), 15000);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkUnread(true);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [pathname, checkUnread]);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.84,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    setHasUnreadMessage(false);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.82,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      router.push('/tabs/chat/Chat');
    }, 90);
  };

  return (
    <Animated.View style={[styles.floatingButtonContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={styles.floatingButton}
        accessibilityRole="button"
        accessibilityLabel="Open Chat with Pharmacist"
      >
        <MaterialCommunityIcons name="message-text-outline" size={26} color="#FFFFFF" />
        {hasUnreadMessage && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 999,
  },
  floatingButton: {
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
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
});
