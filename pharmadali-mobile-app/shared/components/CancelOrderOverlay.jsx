import { Text, View, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native'
import React from 'react'

export default function CancelOrderOverlay({ visible, onClose, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-8" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6 w-full items-center" onPress={(e) => e.stopPropagation()}>
          <View className="w-16 h-16 rounded-full border-4 border-red-500 items-center justify-center mb-4">
            <Text className="text-3xl text-red-500" style={styles.fontBold}>✕</Text>
          </View>

          <Text className="text-xl mb-2" style={styles.cancelTitle}>Cancel Order</Text>
          <Text className="text-sm text-center mb-6" style={styles.fontMedium}>
            Are you sure you want to{'\n'}cancel your order?
          </Text>

          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center bg-[#48AAD9]"
              onPress={onConfirm}
            >
              <Text className="text-sm text-white" style={styles.fontSemiBold}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center border border-[#48AAD9]"
              onPress={onClose}
            >
              <Text className="text-sm" style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  cancelTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#DC3545',
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  cancelBtnText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#48AAD9',
  },
})
