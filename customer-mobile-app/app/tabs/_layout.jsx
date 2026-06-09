import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import BottomBar from '@components/BottomBar';
import TopBar from '@components/TopBar';
import { Slot, usePathname, useRouter } from 'expo-router';
import { colors } from '@src/shared/theme/colorPalette';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import { SelectionPhaseProvider, useSelectionPhase } from '@src/shared/SelectionPhaseContext';
import { SearchProvider } from '@src/shared/SearchContext';
import { useEffect } from 'react';
import { syncFcmTokenWithBackend } from '@shared/utils/notificationUtils';

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

  useEffect(() => {
    // Push notifications are currently disabled
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

