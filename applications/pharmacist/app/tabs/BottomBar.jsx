import React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { Text, View } from 'react-native';
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

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { ordersForReviewCount, readyForPickupCount } = usePharmacistBadgeCounts();

  const index = routes.findIndex(r => {
    if (pathname === r.path) return true;
    const dir = r.path.substring(0, r.path.lastIndexOf('/') + 1);
    return dir !== '/tabs/' && pathname.startsWith(dir);
  });

  return (
    <BottomNavigation.Bar
      navigationState={{ index: index >= 0 ? index : 0, routes }}
      onTabPress={({ route }) => {
        router.push(route.path);
      }}
      style={{ backgroundColor: '#fff' }}
      inactiveColor='#48AAD9'
      activeColor='#48AAD9'
      activeIndicatorStyle={{
        backgroundColor: '#48AAD9',
      }}
      renderIcon={({ route, focused }) => {
        const Icon = focused ? route.focusedIcon : route.unfocusedIcon;
        const showOrdersBadge = route.key === 'orders' && ordersForReviewCount > 0;
        const showReadyBadge = route.key === 'ready' && readyForPickupCount > 0;
        const badgeCount = route.key === 'orders' ? ordersForReviewCount : readyForPickupCount;

        return (
          <View style={{ position: 'relative', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Icon width={24} height={24} />
            {(showOrdersBadge || showReadyBadge) && (
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  backgroundColor: '#EF4444',
                  borderRadius: 8,
                  minWidth: 16,
                  height: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                  borderWidth: 1,
                  borderColor: '#FFFFFF',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 9, fontFamily: 'Poppins-Bold', lineHeight: 11 }}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </Text>
              </View>
            )}
          </View>
        );
      }}
      renderLabel={({ route, focused, color }) => (
        <Text
          style={{
            color: color,
            fontSize: 10,
            textAlign: 'center',
            fontFamily: 'Poppins-Medium',
          }}
          numberOfLines={1}
        >
          {route.title}
        </Text>
      )}
      labeled={true}
    />
  );
}
