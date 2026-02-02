import { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import homeIcon from '../../assets/icons/home_icon.svg';
import homeIconFocused from '../../assets/icons/home_icon_focused.svg';
import ordersIcon from '../../assets/icons/orders_icon.svg';
import ordersIconFocused from '../../assets/icons/orders_icon_focused.svg';
import accountIcon from '../../assets/icons/account_icon.svg';
import accountIconFocused from '../../assets/icons/account_icon_focused.svg';
import shopIcon from '../../assets/icons/shop_icon.svg';
import shopIconFocused from '../../assets/icons/shop_icon_focused.svg';
import notificationsIcon from '../../assets/icons/notifications_icon.svg';
import notificationsIconFocused from '../../assets/icons/notifications_icon_focused.svg';
import HomeTab from './Home';
import { Text } from 'react-native';

export default function BottomBar() {
  const [index, setIndex] = useState(0);
  
  const [routes] = useState([
    { key: 'home', title: 'Home', focusedIcon: homeIconFocused, unfocusedIcon: homeIcon },
    { key: 'shop', title: 'Shop', focusedIcon: shopIconFocused, unfocusedIcon: shopIcon },
    { key: 'orders', title: 'Orders', focusedIcon: ordersIconFocused, unfocusedIcon: ordersIcon },
    { key: 'notifications', title: 'Notifications', focusedIcon: notificationsIconFocused, unfocusedIcon: notificationsIcon },
    { key: 'profile', title: 'Account', focusedIcon: accountIconFocused, unfocusedIcon: accountIcon }
  ]);
  
  const renderScene = () => null;
  
  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: '#fff' }}
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