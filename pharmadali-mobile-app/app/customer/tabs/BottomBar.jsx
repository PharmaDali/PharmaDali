import { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
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
import { Text } from 'react-native';

const routes = [
  { key: 'home', title: 'Home', focusedIcon: homeIconFocused, unfocusedIcon: homeIcon, path: '/customer/tabs/Home' },
  { key: 'shop', title: 'Shop', focusedIcon: shopIconFocused, unfocusedIcon: shopIcon, path: '/customer/tabs/shop/Shop' },
  { key: 'orders', title: 'Orders', focusedIcon: ordersIconFocused, unfocusedIcon: ordersIcon, path: '/customer/tabs/orders/Orders' },
  { key: 'notifications', title: 'Notifications', focusedIcon: notificationsIconFocused, unfocusedIcon: notificationsIcon, path: '/customer/tabs/Notifications' },
  { key: 'profile', title: 'Account', focusedIcon: accountIconFocused, unfocusedIcon: accountIcon, path: '/customer/tabs/account/Account' }
];

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const index = routes.findIndex(r => r.path === pathname) ?? 0;

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