import {
  Text,
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import React from 'react'
import { formatCurrency } from '@src/features/order/orderMappers'

export default function ProceedOtcOverlay({
  visible,
  onClose,
  onConfirm,
  submitting = false,
  rxItems = [],
  otcItems = [],
  newTotal = 0,
  errorMessage = '',
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
        <Pressable
          className="bg-white rounded-3xl p-5 w-full max-h-[85%] shadow-xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header Icon */}
          <View className="items-center mb-3">
            <View className="w-14 h-14 rounded-full border-4 border-[#BAE6FD] bg-[#F0F9FF] items-center justify-center mb-2">
              <Text className="text-2xl text-[#0284C7]" style={styles.fontBold}>✓</Text>
            </View>
            <Text className="text-lg text-center" style={styles.modalTitle}>
              Proceed with OTC Items Only?
            </Text>
            <Text className="text-xs text-center text-gray-500 mt-1 px-2" style={styles.fontMedium}>
              Your prescription items will be removed from this order. We will proceed to prepare your Over-The-Counter items immediately.
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="my-2"
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {/* Prescription items being removed */}
            {rxItems.length > 0 && (
              <View className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-3 mb-3">
                <Text className="text-xs text-[#C53030] mb-2" style={styles.fontBold}>
                  Removing Prescription Items ({rxItems.length}):
                </Text>
                {rxItems.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between items-center py-1">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs text-gray-800" style={styles.fontSemiBold} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text className="text-xs text-[#C53030]" style={styles.fontSemiBold}>
                      {formatCurrency(item.lineTotal || (item.unitPrice * item.quantity) || 0)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Remaining OTC items */}
            {otcItems.length > 0 && (
              <View className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-3 mb-3">
                <Text className="text-xs text-[#0284C7] mb-2" style={styles.fontBold}>
                  Keeping Over-The-Counter Items ({otcItems.length}):
                </Text>
                {otcItems.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between items-center py-1">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs text-gray-800" style={styles.fontSemiBold} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>
                        Qty: {item.quantity}
                      </Text>
                    </View>
                    <Text className="text-xs text-[#0284C7]" style={styles.fontSemiBold}>
                      {formatCurrency(item.lineTotal || (item.unitPrice * item.quantity) || 0)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Updated Total */}
            <View className="flex-row justify-between items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <Text className="text-xs text-gray-700" style={styles.fontBold}>
                Updated Order Total:
              </Text>
              <Text className="text-sm text-[#48AAD9]" style={styles.fontBold}>
                {formatCurrency(newTotal)}
              </Text>
            </View>
          </ScrollView>

          {!!errorMessage && (
            <Text className="text-xs text-red-500 mb-3 text-center" style={styles.fontMedium}>
              {errorMessage}
            </Text>
          )}

          {/* Action Buttons */}
          <View className="flex-row w-full gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 rounded-xl py-2.5 items-center border border-gray-300"
              onPress={onClose}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text className="text-xs text-gray-600" style={styles.fontSemiBold}>
                Keep Reviewing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-xl py-2.5 items-center bg-[#48AAD9]"
              onPress={onConfirm}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-xs text-white" style={styles.fontSemiBold}>
                  Proceed with OTC
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
})

