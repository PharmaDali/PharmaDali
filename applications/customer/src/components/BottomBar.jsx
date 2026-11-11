import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Keyboard,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Badge } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@shared/theme/colorPalette';
import { useUnreadNotifications } from '@shared/hooks/useUnreadNotifications';
import { useSearchContext } from '@shared/context/SearchContext';
import { useFontSize } from '@shared/context/FontSizeContext';

// Icons
import homeIcon from '@assets/icons/home_icon.svg';
import homeIconFocused from '@assets/icons/home_icon_focused.svg';
import ordersIcon from '@assets/icons/orders_icon.svg';
import ordersIconFocused from '@assets/icons/orders_icon_focused.svg';
import accountIcon from '@assets/icons/account_icon.svg';
import accountIconFocused from '@assets/icons/account_icon_focused.svg';
import shopIcon from '@assets/icons/shop_icon.svg';
import shopIconFocused from '@assets/icons/shop_icon_focused.svg';
import notificationsIcon from '@assets/icons/notifications_icon.svg';
import notificationsIconFocused from '@assets/icons/notifications_icon_focused.svg';

const routes = [
  { key: 'home', title: 'Home', focusedIcon: homeIconFocused, unfocusedIcon: homeIcon, path: '/tabs/Home' },
  { key: 'shop', title: 'Shop', focusedIcon: shopIconFocused, unfocusedIcon: shopIcon, path: '/tabs/shop/Shop' },
  { key: 'orders', title: 'Orders', focusedIcon: ordersIconFocused, unfocusedIcon: ordersIcon, path: '/tabs/orders/Orders' },
  { key: 'notifications', title: 'Notifications', focusedIcon: notificationsIconFocused, unfocusedIcon: notificationsIcon, path: '/tabs/Notifications' },
  { key: 'profile', title: 'Account', focusedIcon: accountIconFocused, unfocusedIcon: accountIcon, path: '/tabs/account/Account' }
];

const PILL_WIDTH = 58;
const PILL_HEIGHT = 32;

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { unreadCount, markSeen } = useUnreadNotifications();
  const { setSearchQuery } = useSearchContext();
  const { scaleFontSize } = useFontSize();
  const [barWidth, setBarWidth] = useState(windowWidth);

  const rawIndex = routes.findIndex(r => {
    if (pathname === r.path) return true;
    if (r.key === 'notifications' && pathname.startsWith('/tabs/Notification')) return true;
    const dir = r.path.substring(0, r.path.lastIndexOf('/') + 1);
    return dir !== '/tabs/' && pathname.startsWith(dir);
  });
  const activeIndex = Math.max(0, rawIndex);
  const isNotificationActive = pathname.startsWith('/tabs/Notification') || activeIndex === 3;

  const tabWidth = barWidth / routes.length;
  const initialOffset = activeIndex * tabWidth + (tabWidth - PILL_WIDTH) / 2;
  const slideAnim = useRef(new Animated.Value(initialOffset)).current;

  useEffect(() => {
    if (barWidth > 0) {
      const currentTabWidth = barWidth / routes.length;
      const targetX = activeIndex * currentTabWidth + (currentTabWidth - PILL_WIDTH) / 2;
      Animated.spring(slideAnim, {
        toValue: targetX,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
    }
  }, [activeIndex, barWidth]);

  const handleTabPress = (route) => {
    Keyboard.dismiss();
    if (route.key === 'notifications') {
      markSeen();
    }

    // Clear search input when switching to ANY tab
    setSearchQuery('');

    if (pathname === route.path) return;
    router.replace(route.path);
  };

  return (
    <View
      style={[
        styles.barContainer,
        { paddingBottom: Math.max(insets.bottom, 6) }
      ]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - barWidth) > 1) {
          setBarWidth(w);
        }
      }}
    >
      {/* Sliding Active Pill Indicator */}
      <Animated.View
        style={[
          styles.slidingPill,
          {
            width: PILL_WIDTH,
            height: PILL_HEIGHT,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      />

      {/* Tab Buttons */}
      <View style={styles.tabsRow}>
        {routes.map((route, idx) => {
          const isFocused = activeIndex === idx;
          const Icon = isFocused ? route.focusedIcon : route.unfocusedIcon;

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={() => handleTabPress(route)}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <Icon width={24} height={24} />
                {route.key === 'notifications' && unreadCount > 0 && !isNotificationActive && (
                  <Badge
                    size={10}
                    style={styles.notificationBadge}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    fontSize: scaleFontSize(10),
                    color: isFocused ? colors.buttonColor : '#64748B',
                    fontFamily: isFocused ? 'Poppins-SemiBold' : 'Poppins-Medium',
                  },
                ]}
                numberOfLines={1}
              >
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  slidingPill: {
    position: 'absolute',
    top: 8,
    backgroundColor: colors.buttonColor,
    borderRadius: 16,
    zIndex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    width: '100%',
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 8,
    backgroundColor: '#FF4D4D',
  },
  tabLabel: {
    textAlign: 'center',
    marginTop: 4,
  },
});

