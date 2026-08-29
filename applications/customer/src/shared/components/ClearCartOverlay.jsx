import { Text, View, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function ClearCartOverlay({ visible, onClose, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-8" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6 w-full items-center shadow-xl" onPress={(e) => e.stopPropagation()}>
          <View className="w-16 h-16 rounded-full bg-sky-50 border-4 border-sky-400 items-center justify-center mb-4">
            <MaterialCommunityIcons name="cart-remove" size={32} color="#48AAD9" />
          </View>

          <Text className="text-xl mb-2 text-[#48AAD9]" style={styles.titleFont}>Clear Cart</Text>
          <Text className="text-sm text-center mb-6" style={styles.messageFont}>
            Are you sure you want to remove all{'\n'}items from your cart?
          </Text>

          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center border border-slate-300 bg-gray-50"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-gray-700" style={styles.btnFont}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center bg-[#48AAD9]"
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text className="text-sm text-white" style={styles.btnFont}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titleFont: {
    fontFamily: 'Poppins-Bold',
    color: '#48AAD9',
  },
  messageFont: {
    fontFamily: 'Poppins-Medium',
    color: '#666666',
  },
  btnFont: {
    fontFamily: 'Poppins-SemiBold',
  },
});

