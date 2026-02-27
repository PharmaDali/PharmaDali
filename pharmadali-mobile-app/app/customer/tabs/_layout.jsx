import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import BottomBar from './BottomBar';
import TopBar from './TopBar';
import { Slot, usePathname, useRouter } from 'expo-router';
import { colors } from '@shared/colorPallete';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import { SelectionPhaseProvider, useSelectionPhase } from '@shared/SelectionPhaseContext';

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

function LayoutContent() {
  const pathname = usePathname()
  const detailTitle = detailHeaders[pathname]
  const { selectionPhase } = useSelectionPhase()

  return (
    <View style={styles.container}>
      {!selectionPhase && (detailTitle ? <DetailTopBar title={detailTitle} /> : <TopBar />)}
      <Slot />
      {!selectionPhase && <BottomBar />}
    </View>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <SelectionPhaseProvider>
        <LayoutContent />
      </SelectionPhaseProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});