import { Text, View, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import React from 'react'

const sortOptions = [
  'Best Selling',
  'Price Low to High',
  'Price High to Low',
  'Newest',
  'Most Popular',
]

export default function SortOverlay({ visible, onClose, selected, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6 w-full" onPress={(e) => e.stopPropagation()}>
          <Text className="text-lg mb-4" style={styles.titleBold}>
            Sort by:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {sortOptions.map((option) => {
              const isActive = selected === option
              return (
                <TouchableOpacity
                  key={option}
                  className={`rounded-full border px-4 py-2 ${isActive ? 'bg-[#48AAD9] border-[#48AAD9]' : 'bg-white border-gray-300'}`}
                  onPress={() => onSelect(option)}
                >
                  <Text
                    className="text-sm"
                    style={[styles.fontMedium, { color: isActive ? '#fff' : '#444' }]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  titleBold: {
    fontFamily: 'Poppins-Bold',
    color: '#444',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
})
