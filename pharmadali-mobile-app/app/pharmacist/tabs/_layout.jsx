import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { Slot } from 'expo-router';
import TopBar from './TopBar';
import BottomBar from './BottomBar';

function LayoutContent() {
  return (
    <View style={styles.container}>
      <TopBar />
      <Slot />
      <BottomBar />
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
