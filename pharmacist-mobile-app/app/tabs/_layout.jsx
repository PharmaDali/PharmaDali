import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Slot, usePathname, useRouter } from 'expo-router';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { configureForegroundNotifications, syncFcmTokenWithBackend } from '@shared/utils/notificationUtils';

// Configure foreground notification presentation at module level
configureForegroundNotifications();

function LayoutContent() {
  const pathname = usePathname();
  const router = useRouter();
  const isChatRoute = pathname?.startsWith('/tabs/chat');
  const notificationResponseListener = useRef();

  useEffect(() => {
    // Register device and sync the Expo Push Token to the backend
    syncFcmTokenWithBackend();

    // Handle notification taps — navigate to the pharmacist orders screen
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (!data) return;

      const { order_id, order_number } = data;

      if (order_id) {
        // Navigate to the orders screen; pharmacist order detail uses Orders screen with param
        router.push({
          pathname: '/tabs/orders/Orders',
          params: {
            highlightOrderId: String(order_id),
            orderNumber: order_number ?? '',
          },
        });
      } else {
        router.push('/tabs/orders/Orders');
      }
    });

    return () => {
      notificationResponseListener.current?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {!isChatRoute && <TopBar />}
      <Slot />
      {!isChatRoute && <BottomBar />}
    </View>
  );
}

export default function PharmacistTabsLayout() {
  return (
    <PaperProvider>
      <LayoutContent />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

