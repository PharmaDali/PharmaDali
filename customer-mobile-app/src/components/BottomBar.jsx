import { BottomNavigation } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { Text, View } from 'react-native';
import { colors } from '@shared/theme/colorPalette';

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
  { key: 'home', title: 'Home', focusedIcon: homeIconFocused, unfocusedIcon: homeIcon, path: '/customer/tabs/Home' },
  { key: 'shop', title: 'Shop', focusedIcon: shopIconFocused, unfocusedIcon: shopIcon, path: '/customer/tabs/shop/Shop' },
  { key: 'orders', title: 'Orders', focusedIcon: ordersIconFocused, unfocusedIcon: ordersIcon, path: '/customer/tabs/orders/Orders' },
  { key: 'notifications', title: 'Notifications', focusedIcon: notificationsIconFocused, unfocusedIcon: notificationsIcon, path: '/customer/tabs/Notifications' },
  { key: 'profile', title: 'Account', focusedIcon: accountIconFocused, unfocusedIcon: accountIcon, path: '/customer/tabs/account/Account' }
];

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();

  const index = routes.findIndex(r => {
    if (pathname === r.path) return true;
    const dir = r.path.substring(0, r.path.lastIndexOf('/') + 1);
    return dir !== '/customer/tabs/' && pathname.startsWith(dir);
  });

  return (
    <BottomNavigation.Bar
      navigationState={{ index: index >= 0 ? index : 0, routes }}
      onTabPress={({ route }) => {
        if (pathname === route.path) return;
        router.replace(route.path);
      }}
      style={{ backgroundColor: '#fff' }}
      inactiveColor={colors.buttonColor}
      activeColor={colors.buttonColor}
      activeIndicatorStyle={{
        backgroundColor: 'transparent', 
      }}
      renderIcon={({ route, focused, color }) => {
        const Icon = focused ? route.focusedIcon : route.unfocusedIcon;
        const useStroke = ['home', 'shop'].includes(route.key);
        
        return (
          <Icon 
            width={24} 
            height={24} 
            fill={useStroke ? 'none' : color} 
            stroke={useStroke ? color : undefined}
            strokeWidth={useStroke ? 2 : undefined}
          />
        );
      }}
      renderLabel={({ route, color }) => (
        <Text
          className="text-[10px] text-center"
          style={{ color, fontFamily: 'Poppins-Medium' }}
          numberOfLines={1}
        >
          {route.title}
        </Text>
      )}
      labeled={true}
    />
  );
}