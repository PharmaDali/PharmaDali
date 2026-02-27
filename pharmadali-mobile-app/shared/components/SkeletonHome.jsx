import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
        { width, height, borderRadius, backgroundColor: '#E0E0E0', opacity },
        style,
      ]}
    />
  );
}

export default function SkeletonHome() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white px-4" style={{ paddingTop: insets.top + 16 }}>
      <SkeletonBlock width="70%" height={28} style={{ marginBottom: 6 }} />
      <SkeletonBlock width="45%" height={28} style={{ marginBottom: 16 }} />

      <View className="items-end mb-6">
        <SkeletonBlock width="60%" height={36} borderRadius={20} />
      </View>

      <SkeletonBlock width="100%" height={160} borderRadius={12} style={{ marginBottom: 24 }} />

      <View className="flex-row justify-between items-center mb-4">
        <SkeletonBlock width="35%" height={22} />
        <SkeletonBlock width="15%" height={18} />
      </View>

      <View className="flex-row justify-between mb-6">
        {[...Array(5)].map((_, i) => (
          <View key={i} className="items-center">
            <SkeletonBlock width={56} height={56} borderRadius={28} style={{ marginBottom: 6 }} />
            <SkeletonBlock width={44} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <SkeletonBlock width="55%" height={22} />
        <SkeletonBlock width="15%" height={18} />
      </View>

      <View className="flex-row">
        {[...Array(3)].map((_, i) => (
          <View key={i} style={{ width: 150, marginRight: 12 }}>
            <SkeletonBlock width={150} height={120} borderRadius={10} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="90%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
            <SkeletonBlock width="60%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
            <SkeletonBlock width="40%" height={14} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}
