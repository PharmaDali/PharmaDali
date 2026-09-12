import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import CartIcon from '@assets/icons/cart_icon.svg';
import { getCartItemCount } from '@shared/services/cartService';
import { subscribeCartCountUpdates } from '@shared/services/cartCountEvents';
import { resetCartProductIdsCache, initializeCartProductIdsCache } from '@shared/utils/cartUtils';
import { useFlyToCart } from '@shared/context/FlyToCartContext';

export default function CartButton({ style }) {
  const router = useRouter();
  const { setCartTargetPos, registerLandingListener } = useFlyToCart();
  const [cartCount, setCartCount] = useState(0);
  const cartIconRef = useRef(null);
  const badgeScale = useRef(new Animated.Value(1)).current;
  const cartShakeAnim = useRef(new Animated.Value(0)).current;

  const shakeCart = useCallback(() => {
    Animated.sequence([
      Animated.timing(cartShakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(cartShakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(cartShakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(cartShakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(cartShakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
      Animated.timing(cartShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [cartShakeAnim]);

  const pulseBadge = useCallback(() => {
    shakeCart();
    Animated.sequence([
      Animated.timing(badgeScale, { toValue: 1.35, duration: 150, useNativeDriver: true }),
      Animated.timing(badgeScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [badgeScale, shakeCart]);

  const loadCartCount = useCallback(async () => {
    try {
      const count = await getCartItemCount();
      setCartCount(count);
      resetCartProductIdsCache();
      initializeCartProductIdsCache();
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  useEffect(() => {
    const unsubscribe = subscribeCartCountUpdates((event) => {
      if (event && event.type === 'increment') {
        setCartCount((prev) => prev + (event.quantity || 1));
      } else {
        loadCartCount();
      }
    });

    return unsubscribe;
  }, [loadCartCount]);

  useEffect(() => {
    const unsubscribe = registerLandingListener(() => {
      pulseBadge();
    });

    return unsubscribe;
  }, [registerLandingListener, pulseBadge]);

  const handleCartLayout = useCallback(() => {
    if (cartIconRef.current && cartIconRef.current.measureInWindow) {
      cartIconRef.current.measureInWindow((x, y, width, height) => {
        if (x && y) {
          setCartTargetPos({ x: x + width / 2, y: y + height / 2 });
        }
      });
    }
  }, [setCartTargetPos]);

  const cartRotation = cartShakeAnim.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-16deg', '16deg'],
  });

  return (
    <TouchableOpacity
      onPress={() => router.push('/tabs/cart/Cart')}
      activeOpacity={0.7}
      style={style}
    >
      <Animated.View
        ref={cartIconRef}
        onLayout={handleCartLayout}
        style={{ transform: [{ rotate: cartRotation }] }}
        className="relative w-[30px] h-[30px] items-center justify-center"
      >
        <CartIcon width={30} height={30} />
        {cartCount > 0 && (
          <Animated.View
            style={{ transform: [{ scale: badgeScale }] }}
            className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center border border-white"
          >
            <Text
              className="text-[10px] leading-[12px] text-white"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              {cartCount > 99 ? '99+' : String(cartCount)}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

