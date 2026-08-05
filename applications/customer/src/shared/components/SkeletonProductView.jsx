import React, { useEffect, useRef } from 'react';
import { View, Animated, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@shared/theme/colorPalette';

function SkeletonBlock({ width, height, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#E1E5F2', opacity },
        style,
      ]}
    />
  );
}

export default function SkeletonProductView() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      {/* Header spacing */}
      <View style={[styles.header, { height: insets.top + 50 }]} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Image area */}
        <View className="items-center bg-gray-50 py-4">
          <SkeletonBlock width={260} height={260} borderRadius={24} />
        </View>

        {/* Product Name and Price */}
        <View className="px-5 pt-4 pb-3">
          <SkeletonBlock width="100%" height={24} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="70%" height={24} style={{ marginBottom: 16 }} />
          <SkeletonBlock width="40%" height={32} />
        </View>

        {/* Add to cart button */}
        <View className="px-5 mb-4">
          <SkeletonBlock width="100%" height={48} borderRadius={12} />
        </View>

        <View className="h-2 bg-gray-100" />

        {/* Expansion area / details title */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <SkeletonBlock width="40%" height={20} />
          <SkeletonBlock width={24} height={24} borderRadius={12} />
        </View>

        <View className="h-2 bg-gray-100" />

        {/* Similar products section */}
        <View className="px-5 pt-4 pb-6">
          <SkeletonBlock width="50%" height={24} style={{ marginBottom: 12 }} />
          <View className="flex-row">
            {[...Array(3)].map((_, i) => (
              <View key={i} style={{ width: 150, marginRight: 12 }}>
                <SkeletonBlock width={150} height={210} borderRadius={12} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: colors.buttonColor,
  },
});
