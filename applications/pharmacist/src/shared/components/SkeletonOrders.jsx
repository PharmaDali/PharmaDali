import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

function SkeletonBlock({ width, height, borderRadius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    )

    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#E0E0E0', opacity },
        style,
      ]}
    />
  )
}

function SkeletonOrderCard() {
  return (
    <View className="border border-gray-200 bg-white rounded-2xl py-4 px-4 mt-4 mx-4 shadow-md elevation-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <SkeletonBlock width="45%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="60%" height={10} borderRadius={4} />
        </View>
        <SkeletonBlock width={92} height={28} borderRadius={8} />
      </View>

      <View className="border-b border-gray-200 my-3" />

      {[0, 1].map((row) => (
        <View key={row} className="flex-row mt-3">
          <SkeletonBlock width={64} height={64} borderRadius={8} />
          <View className="flex-1 ml-3">
            <SkeletonBlock width="88%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonBlock width="70%" height={12} borderRadius={4} style={{ marginBottom: 10 }} />
            <View className="flex-row justify-between items-center">
              <SkeletonBlock width="30%" height={12} borderRadius={4} />
              <View className="items-end">
                <SkeletonBlock width={26} height={10} borderRadius={4} style={{ marginBottom: 4 }} />
                <SkeletonBlock width={44} height={10} borderRadius={4} />
              </View>
            </View>
          </View>
        </View>
      ))}

      <View className="border-b border-gray-200 my-3" />

      <View className="flex-row justify-between items-center mb-4">
        <SkeletonBlock width="35%" height={12} borderRadius={4} />
        <SkeletonBlock width="22%" height={12} borderRadius={4} />
      </View>

      <View className="items-center">
        <SkeletonBlock width={136} height={34} borderRadius={12} />
      </View>
    </View>
  )
}

export default function SkeletonOrders() {
  return (
    <View className="mt-4 mb-4">
      <SkeletonOrderCard />
      <SkeletonOrderCard />
    </View>
  )
}
