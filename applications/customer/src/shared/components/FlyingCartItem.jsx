import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';
import ProductImage from '@shared/components/ProductImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FlyingCartItem({ item, targetPos, onComplete }) {
  const animProgress = useRef(new Animated.Value(0)).current;

  const startX = item.startX ?? (SCREEN_WIDTH / 2);
  const startY = item.startY ?? 300;
  const targetX = targetPos?.x ?? (SCREEN_WIDTH - 40);
  const targetY = targetPos?.y ?? 40;

  const controlY = Math.max(targetY + 15, startY - (startY - targetY) * 0.55);

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 950,
      useNativeDriver: true,
    }).start(() => {
      onComplete?.(item.id);
    });
  }, [animProgress, item.id, onComplete]);

  const translateX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX - 24, targetX - 24],
  });

  const translateY = animProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [startY - 24, controlY - 24, targetY - 24],
  });

  const scale = animProgress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 0.6, 0.3],
  });

  const opacity = animProgress.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 0.9, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.flyingContainer,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <ProductImage 
         source={item.img}
         product={item.product}
         width={44}
         height={44}
         containerStyle={{ borderRadius: 22, borderWidth: 0 }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flyingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#48AAD9',
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  fallbackBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f0fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 20,
  },
});
