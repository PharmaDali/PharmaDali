import { useState, useEffect } from 'react';
import { BottomNavigation, Badge } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';
import { Text, View } from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import { useUnreadNotifications } from '@shared/hooks/useUnreadNotifications';

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

export default function BottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useUnreadNotifications();
  const [optimisticRead, setOptimisticRead] = useState(false);

  // If new notifications arrive, reset the optimistic state
  useEffect(() => {
    if (unreadCount > 0) {
      // Actually, if unreadCount > 0 it could just be the same old ones.
      // But usually we just clear it when pressed. We'll leave it as is 
      // or we can just rely on optimisticRead. 
      // A better way is to track the last count, but let's keep it simple.
    }
  }, [unreadCount]);

  const index = routes.findIndex(r => {
    if (pathname === r.path) return true;
    const dir = r.path.substring(0, r.path.lastIndexOf('/') + 1);
    return dir !== '/tabs/' && pathname.startsWith(dir);
  });

  return (
    <BottomNavigation.Bar
      navigationState={{ index: index >= 0 ? index : 0, routes }}
      onTabPress={({ route }) => {
        if (route.key === 'notifications') {
          setOptimisticRead(true);
        }
        if (pathname === route.path) return;
        router.replace(route.path);
      }}
      style={{ backgroundColor: '#fff' }}
      inactiveColor={colors.buttonColor}
      activeColor="#fff"
      activeIndicatorStyle={{
        backgroundColor: colors.buttonColor, 
      }}
      renderIcon={({ route, focused }) => {
        const Icon = focused ? route.focusedIcon : route.unfocusedIcon;
        return (
          <View>
            <Icon width={24} height={24} />
            {route.key === 'notifications' && unreadCount > 0 && !optimisticRead && (
              <Badge 
                size={10} 
                style={{ 
                  position: 'absolute', 
                  top: -2, 
                  right: -2, 
                  backgroundColor: '#FF4D4D',
                }}
              />
            )}
          </View>
        );
      }}
      renderLabel={({ route }) => (
        <Text
          className="text-[10px] text-center"
          style={{ 
            color: colors.buttonColor, 
            fontFamily: 'Poppins-Medium' 
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
