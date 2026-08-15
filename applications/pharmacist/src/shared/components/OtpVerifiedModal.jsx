import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import SuccessIcon from '@assets/icons/account/change-password/success.svg';

const OtpVerifiedModal = ({ visible, onContinue }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        if (onContinue) onContinue();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onContinue]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onContinue}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="w-full bg-white rounded-2xl p-6 items-center shadow-lg">
          <View className="w-24 h-24 rounded-full bg-[#D1FADF] items-center justify-center mb-4">
            <SuccessIcon width={70} height={70} />
          </View>

          <Text className="text-xl text-center mb-2" style={styles.title}>
            OTP Verified!
          </Text>
          
          <Text className="text-sm text-center leading-5 mb-6" style={styles.message}>
            You can now set your new password.
          </Text>

          <TouchableOpacity
            className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center"
            onPress={onContinue}
          >
            <Text className="text-base" style={styles.primaryButtonText}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OtpVerifiedModal;

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Poppins-Bold',
    color: '#48AAD9',
    includeFontPadding: false,
  },
  message: {
    fontFamily: 'Poppins-Regular',
    color: '#555555',
    includeFontPadding: false,
  },
  primaryButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
