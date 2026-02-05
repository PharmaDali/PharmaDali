import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import BottomBar from './BottomBar';
import TopBar from './TopBar';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <PaperProvider>
      <View style={styles.container}>
        <TopBar />
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