import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Slot, usePathname } from 'expo-router';
import TopBar from './TopBar';
import BottomBar from './BottomBar';

function LayoutContent() {
  const pathname = usePathname();
  const isChatRoute = pathname?.startsWith('/tabs/chat');

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
