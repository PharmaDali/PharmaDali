import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SuccessIcon from '@assets/icons/account/change-password/success.svg';

export default function PaymentSuccessModal({
  visible,
  title = 'Payment Receipt Uploaded!',
  message = 'Your GCash payment receipt has been submitted successfully. The pharmacy will verify your payment shortly.',
  buttonText = 'OK',
  onClose,
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="w-full max-w-[340px] bg-white rounded-3xl p-6 items-center shadow-xl">
          {/* Circular Success Icon */}
          <View className="w-20 h-20 rounded-full bg-[#D1FADF] items-center justify-center mb-4">
            <SuccessIcon width={60} height={60} />
          </View>

          {/* Title */}
          <Text className="text-lg text-center mb-2" style={styles.title}>
            {title}
          </Text>

          {/* Message */}
          <Text className="text-xs text-center leading-5 text-[#555555] mb-6" style={styles.message}>
            {message}
          </Text>

          {/* Primary Action Button */}
          <TouchableOpacity
            className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center justify-center active:opacity-90"
            onPress={onClose}
          >
            <Text className="text-sm text-white" style={styles.buttonText}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    includeFontPadding: false,
  },
  message: {
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    includeFontPadding: false,
  },
});
