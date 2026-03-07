import { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import dashboardIcon from '@assets/icons/pharmacist_bottombar/dashboard_icon.svg';
import dashboardActiveIcon from '@assets/icons/pharmacist_bottombar/dashboard_active_icon.svg';
import orderActiveIcon from '@assets/icons/pharmacist_bottombar/orders_active_icon.svg';
import orderIcon from '@assets/icons/pharmacist_bottombar/orders_icon.svg';
import readyActiveIcon from '@assets/icons/pharmacist_bottombar/ready_active_icon.svg';
import readyIcon from '@assets/icons/pharmacist_bottombar/ready_icon.svg';
import accountIcon from '@assets/icons/pharmacist_bottombar/profile_icon.svg';
import accountActiveIcon from '@assets/icons/pharmacist_bottombar/profile_active_icon.svg';
import { Text } from 'react-native';

const routes = [
  { key: 'dashboard', title: 'Dashboard', focusedIcon: dashboardActiveIcon, unfocusedIcon: dashboardIcon, path: '/pharmacist/tabs/Home' },
  { key: 'orders', title: 'Orders', focusedIcon: orderActiveIcon, unfocusedIcon: orderIcon, path: '/pharmacist/tabs/orders/Orders' },
  { key: 'ready', title: 'Ready', focusedIcon: readyActiveIcon, unfocusedIcon: readyIcon, path: '/pharmacist/tabs/ready/Ready' },
  { key: 'account', title: 'Account', focusedIcon: accountActiveIcon, unfocusedIcon: accountIcon, path: '/pharmacist/tabs/account/Account' }
];

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const index = routes.findIndex(r => {
    if (pathname === r.path) return true;
    const dir = r.path.substring(0, r.path.lastIndexOf('/') + 1);
    return dir !== '/pharmacist/tabs/' && pathname.startsWith(dir);
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