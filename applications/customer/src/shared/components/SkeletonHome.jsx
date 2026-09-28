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
    <View className="flex-1 bg-white px-4" style={{ paddingTop: insets.top + 8 }}>
      {/* ── Top Bar: Pharmacy Selector Dropdown Pill (Right Aligned) ── */}
      <View className="items-end pt-2 mb-3">
        <SkeletonBlock width={190} height={34} borderRadius={20} />
      </View>

      {/* ── Greeting Section (Left Aligned) ── */}
      <View className="mb-3.5">
        <SkeletonBlock width={210} height={24} borderRadius={6} />
      </View>

      {/* ── Hero Banner Section ── */}
      <SkeletonBlock width="100%" height={200} borderRadius={16} style={{ marginBottom: 20 }} />

      {/* ── Categories Section Header ── */}
      <View className="flex-row justify-between items-center mb-3">
        <SkeletonBlock width={100} height={20} borderRadius={4} />
        <SkeletonBlock width={50} height={16} borderRadius={4} />
      </View>

      {/* ── Categories Slider (5 round icons) ── */}
      <View className="flex-row justify-between mb-6">
        {[...Array(5)].map((_, i) => (
          <View key={i} className="items-center">
            <SkeletonBlock width={54} height={54} borderRadius={27} style={{ marginBottom: 6 }} />
            <SkeletonBlock width={42} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* ── Recommendations Section Header ── */}
      <View className="flex-row justify-between items-center mb-3">
        <SkeletonBlock width={150} height={22} borderRadius={4} />
      </View>

      {/* ── Product Cards Grid (2 Columns) ── */}
      <View className="flex-row justify-between">
        {[...Array(2)].map((_, i) => (
          <View key={i} style={{ width: '48%' }}>
            <SkeletonBlock width="100%" height={145} borderRadius={16} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="85%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
            <SkeletonBlock width="55%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="40%" height={16} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}
