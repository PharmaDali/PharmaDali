import React, { useRef, useState } from 'react';
import { View, Image, ScrollView, Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ImageSlider({ images, height = 260 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
      >
        {images.map((img, index) => (
          <View key={index} style={{ width: SCREEN_WIDTH, height }} className="items-center justify-center bg-white px-6">
            <Image
              source={typeof img === 'string' ? { uri: img } : img}
              style={{ width: SCREEN_WIDTH - 48, height: height - 20 }}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View className="flex-row justify-center mt-3">
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#48AAD9',
  },
  dotInactive: {
    backgroundColor: '#D1D5DB',
  },
});
