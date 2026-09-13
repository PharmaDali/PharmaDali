import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

function SkeletonBlock({ width, height, borderRadius = 4, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#E2E8F0', opacity },
        style,
      ]}
    />
  );
}

function SkeletonChatItem() {
  return (
    <View className="flex-row items-center px-4 py-3">
      {/* Avatar */}
      <SkeletonBlock width={52} height={52} borderRadius={26} style={{ marginRight: 12 }} />

      {/* Content */}
      <View className="flex-1 mr-1.5">
        <View className="flex-row items-center justify-between mb-1.5">
          <SkeletonBlock width="45%" height={14} borderRadius={4} />
          <SkeletonBlock width={38} height={10} borderRadius={4} />
        </View>

        <SkeletonBlock width="35%" height={11} borderRadius={4} style={{ marginBottom: 6 }} />

        <SkeletonBlock width="75%" height={12} borderRadius={4} />
      </View>
    </View>
  );
}

export default function SkeletonChat({ count = 6 }) {
  return (
    <View className="flex-1 bg-white pt-2">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonChatItem key={index} />
      ))}
    </View>
  );
}

