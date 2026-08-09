import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

function SkeletonBlock({ width, height, borderRadius = 12, style }) {
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

export function SkeletonProductCard() {
  return (
    <View className="w-1/2 px-1 mb-4">
      <View className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm" style={{ height: 250 }}>
        <SkeletonBlock width="100%" height={120} borderRadius={10} style={{ marginBottom: 12 }} />
        <SkeletonBlock width="40%" height={12} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="85%" height={16} borderRadius={4} style={{ marginBottom: 12 }} />
        <View className="flex-row justify-between items-center mt-auto">
          <SkeletonBlock width="50%" height={18} borderRadius={4} />
          <SkeletonBlock width={32} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}

export default function SkeletonCategoryGrid({ count = 6 }) {
  return (
    <View className="flex-row flex-wrap px-3 pt-2">
      {[...Array(count)].map((_, index) => (
        <SkeletonProductCard key={index} />
      ))}
    </View>
  );
}
