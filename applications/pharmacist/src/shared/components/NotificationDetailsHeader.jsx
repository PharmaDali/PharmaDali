import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import MainLogoSVG from '@assets/main_logo.svg';

export default function NotificationDetailsHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    try {
      router.back();
    } catch {
      router.replace('/tabs/Notifications');
    }
  };

  return (
    <View
      style={[
        styles.headerContainer,
        { paddingTop: Math.max(insets.top, 16) },
      ]}
    >
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <ArrowBackIcon width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <MainLogoSVG width={200} height={48} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#96D2EE',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    height: 48,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
    padding: 4,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
