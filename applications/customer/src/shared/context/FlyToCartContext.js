import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import FlyingCartItem from '@shared/components/FlyingCartItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FlyToCartContext = createContext({
  triggerFlyToCart: () => {},
  setCartTargetPos: () => {},
  registerLandingListener: () => () => {},
  cartTargetPos: { x: SCREEN_WIDTH - 40, y: 40 },
});

export function FlyToCartProvider({ children }) {
  const [flyingItems, setFlyingItems] = useState([]);
  const [cartTargetPos, setCartTargetPos] = useState({
    x: SCREEN_WIDTH - 40,
    y: 40,
  });
  const landingListenersRef = useRef(new Set());

  const registerLandingListener = useCallback((listener) => {
    if (typeof listener !== 'function') return () => {};
    landingListenersRef.current.add(listener);
    return () => {
      landingListenersRef.current.delete(listener);
    };
  }, []);

  const triggerFlyToCart = useCallback(({ startX, startY, img }) => {
    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      startX: startX ?? (SCREEN_WIDTH / 2),
      startY: startY ?? 300,
      img,
    };
    setFlyingItems((prev) => [...prev, newItem]);
  }, []);

  const handleAnimationComplete = useCallback((id) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    // Trigger cart shake & pulse ONLY when item animation lands at the cart
    for (const listener of landingListenersRef.current) {
      try {
        listener();
      } catch {
        // Ignore listener error
      }
    }
  }, []);

  return (
    <FlyToCartContext.Provider value={{ triggerFlyToCart, setCartTargetPos, registerLandingListener, cartTargetPos }}>
      <View style={styles.flexOne}>
        {children}
        <View style={styles.overlay} pointerEvents="none">
          {flyingItems.map((item) => (
            <FlyingCartItem
              key={item.id}
              item={item}
              targetPos={cartTargetPos}
              onComplete={handleAnimationComplete}
            />
          ))}
        </View>
      </View>
    </FlyToCartContext.Provider>
  );
}

export function useFlyToCart() {
  return useContext(FlyToCartContext);
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
});
