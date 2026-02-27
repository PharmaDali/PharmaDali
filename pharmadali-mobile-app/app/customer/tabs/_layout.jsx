import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import BottomBar from './BottomBar';
import TopBar from './TopBar';
import { Slot, usePathname, useRouter } from 'expo-router';
import { colors } from '@shared/colorPallete';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';

const detailHeaders = {
  '/customer/tabs/orders/ViewOrderDetails': 'Order Details',
}

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

export default function RootLayout() {
  const pathname = usePathname()
  const detailTitle = detailHeaders[pathname]

  return (
    <PaperProvider>
      <View style={styles.container}>
        {detailTitle ? <DetailTopBar title={detailTitle} /> : <TopBar />}
        <Slot />
        <BottomBar />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});