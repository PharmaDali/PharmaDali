import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import BottomBar from '@components/BottomBar';
import TopBar from '@components/TopBar';
import { Slot, usePathname, useRouter } from 'expo-router';
import { colors } from '@src/shared/theme/colorPalette';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import { SelectionPhaseProvider, useSelectionPhase } from '@src/shared/SelectionPhaseContext';
import { SearchProvider } from '@src/shared/SearchContext';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { configureForegroundNotifications, syncFcmTokenWithBackend } from '@shared/utils/notificationUtils';

// Configure foreground notification presentation at module level
configureForegroundNotifications();

const detailHeaders = {
  '/tabs/orders/ViewOrderDetails': 'Order Details',
}

const fullScreenRoutes = [
  '/tabs/cart/Cart',
  '/tabs/cart/ReviewOrder',
  '/tabs/cart/UploadPrescription',
  '/tabs/cart/PickupDetails',
  '/tabs/cart/OrderSubmitted',
  '/tabs/shop/ProductView',
  '/tabs/chat/Chat',
  '/tabs/chat/Conversation',
]

function DetailTopBar({ title }) {
  const router = useRouter()
  return (
    <View className="flex-row items-center px-5 pt-12 pb-5" style={{ backgroundColor: colors.buttonColor }}>
      <TouchableOpacity onPress={() => router.back()} className="mr-3">
        <ArrowBackIcon width={24} height={24} />
      </TouchableOpacity>
      <Text className="text-lg text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>{title}</Text>
    </View>
  )
}

function LayoutContent() {
  const pathname = usePathname()
  const router = useRouter()
  const detailTitle = detailHeaders[pathname]
  const isFullScreen = fullScreenRoutes.includes(pathname)
  const { selectionPhase } = useSelectionPhase()
  const notificationResponseListener = useRef();

  useEffect(() => {
    // Register device and sync the Expo Push Token to the backend
    syncFcmTokenWithBackend();

    // Handle notification taps — navigate to the relevant screen
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (!data) return;

      const { type, order_id, order_number } = data;

      if (order_id) {
        router.push({
          pathname: '/tabs/orders/ViewOrderDetails',
          params: {
            orderId: String(order_id),
            orderNumber: order_number ?? '',
          },
        });
        return;
      }

      if (type === 'order_completed' || type === 'order_rejected' || type === 'order_expired') {
        router.push({ pathname: '/tabs/orders/Orders', params: { tab: 'completed' } });
        return;
      }

      if (type === 'order_placed' || type === 'order_status_change') {
        router.push('/tabs/orders/Orders');
      }
    });

    return () => {
      notificationResponseListener.current?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {!selectionPhase && !isFullScreen && (detailTitle ? <DetailTopBar title={detailTitle} /> : <TopBar />)}
      <Slot />
      {!selectionPhase && !isFullScreen && <BottomBar />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <SelectionPhaseProvider>
        <SearchProvider>
          <LayoutContent />
        </SearchProvider>
      </SelectionPhaseProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


