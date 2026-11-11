import React, { useState, useEffect, useRef } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@shared/theme/colorPalette';
import { usePharmacistBadgeCounts } from '@shared/hooks/usePharmacistBadgeCounts';

import dashboardIcon from '@assets/icons/pharmacist_bottombar/dashboard_icon.svg';
import dashboardActiveIcon from '@assets/icons/pharmacist_bottombar/dashboard_active_icon.svg';
import orderActiveIcon from '@assets/icons/pharmacist_bottombar/orders_active_icon.svg';
import orderIcon from '@assets/icons/pharmacist_bottombar/orders_icon.svg';
import readyActiveIcon from '@assets/icons/pharmacist_bottombar/ready_active_icon.svg';
import readyIcon from '@assets/icons/pharmacist_bottombar/ready_icon.svg';
import accountIcon from '@assets/icons/pharmacist_bottombar/profile_icon.svg';
import accountActiveIcon from '@assets/icons/pharmacist_bottombar/profile_active_icon.svg';

const routes = [
  { key: 'dashboard', title: 'Dashboard', focusedIcon: dashboardActiveIcon, unfocusedIcon: dashboardIcon, path: '/tabs/Home' },
  { key: 'orders', title: 'Orders', focusedIcon: orderActiveIcon, unfocusedIcon: orderIcon, path: '/tabs/orders/Orders' },
  { key: 'ready', title: 'Ready', focusedIcon: readyActiveIcon, unfocusedIcon: readyIcon, path: '/tabs/ready/Ready' },
  { key: 'account', title: 'Account', focusedIcon: accountActiveIcon, unfocusedIcon: accountIcon, path: '/tabs/account/Account' }
];

const PILL_WIDTH = 64;
const PILL_HEIGHT = 32;

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { ordersForReviewCount, readyForPickupCount } = usePharmacistBadgeCounts();
  const [barWidth, setBarWidth] = useState(windowWidth);

  const rawIndex = routes.findIndex(r => {
    if (pathname === r.path) return true;
    const dir = r.path.substring(0, r.path.lastIndexOf('/') + 1);
    return dir !== '/tabs/' && pathname.startsWith(dir);
  });
  const activeIndex = Math.max(0, rawIndex);

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
    if (pathname === route.path) return;
    router.push(route.path);
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
          const showOrdersBadge = route.key === 'orders' && ordersForReviewCount > 0;
          const showReadyBadge = route.key === 'ready' && readyForPickupCount > 0;
          const badgeCount = route.key === 'orders' ? ordersForReviewCount : readyForPickupCount;

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={() => handleTabPress(route)}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <Icon width={24} height={24} />
                {(showOrdersBadge || showReadyBadge) && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
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
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    lineHeight: 11,
  },
  tabLabel: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 4,
  },
});
