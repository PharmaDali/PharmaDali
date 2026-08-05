import { Text, View, Modal, TouchableOpacity, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'

export default function CancelOrderOverlay({ visible, onClose, onConfirm, submitting = false, errorMessage = '' }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (visible) {
      setReason('')
    }
  }, [visible])

  const handleConfirm = () => {
    onConfirm(reason.trim() || 'Cancelled by customer')
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-8" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6 w-full items-center shadow-xl" onPress={(e) => e.stopPropagation()}>
          <View className="w-16 h-16 rounded-full border-4 border-red-500 bg-red-50 items-center justify-center mb-4">
            <Text className="text-3xl text-red-500" style={styles.fontBold}>✕</Text>
          </View>

          <Text className="text-xl mb-2" style={styles.cancelTitle}>Cancel Order</Text>
          <Text className="text-sm text-center mb-4" style={styles.fontMedium}>
            Are you sure you want to cancel your order?
          </Text>

          <TextInput
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs mb-4 text-gray-800"
            placeholder="Reason for cancellation (optional)"
            placeholderTextColor="#9CA3AF"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
            style={styles.fontMedium}
          />

          {!!errorMessage && (
            <Text className="text-xs text-red-500 mb-4 text-center font-medium" style={styles.fontMedium}>
              {errorMessage}
            </Text>
          )}

          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center border border-[#48AAD9]"
              onPress={onClose}
              disabled={submitting}
            >
              <Text className="text-sm" style={styles.cancelBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center bg-[#DC3545]"
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-sm text-white" style={styles.fontSemiBold}>Yes, Cancel</Text>
              )}
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
