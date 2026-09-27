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
          {/* Header with Title, Reset and X close button */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg" style={styles.titleBold}>
              Sort by{selected ? `: ${selected}` : ''}
            </Text>
            <View className="flex-row items-center gap-2">
              {Boolean(selected) && (
                <TouchableOpacity onPress={() => onSelect(null)} className="mr-1">
                  <Text className="text-sm text-[#48AAD9]" style={{ fontFamily: 'Poppins-SemiBold' }}>
                    Reset
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-base text-gray-500 font-bold leading-none">✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {sortOptions.map((option) => {
              const isActive = selected === option
              return (
                <TouchableOpacity
                  key={option}
                  className={`rounded-full border px-4 py-2 ${isActive ? 'bg-[#48AAD9] border-[#48AAD9]' : 'bg-white border-gray-300'}`}
                  onPress={() => onSelect(isActive ? null : option)}
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
