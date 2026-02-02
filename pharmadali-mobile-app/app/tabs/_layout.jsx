import { View, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import BottomBar from './BottomBar';

export default function RootLayout() {
  return (
    <PaperProvider>
      <View style={styles.container}>
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