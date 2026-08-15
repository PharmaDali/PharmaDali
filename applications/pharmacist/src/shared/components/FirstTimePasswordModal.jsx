import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import ChangePassHeroIcon from '@assets/icons/account/change-password/change_pass_hero.svg';

const FirstTimePasswordModal = ({ visible, onClose, onChangePassword }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="w-full bg-white rounded-2xl p-6 items-center shadow-lg">
          <View className="mb-4 items-center justify-center">
            <ChangePassHeroIcon width={70} height={70} />
          </View>

          <Text className="text-lg text-center mb-2" style={styles.title}>
            Update Your Password
          </Text>
          
          <Text className="text-xs text-center leading-5 mb-6" style={styles.message}>
            Since your account was created recently, please change your default password for enhanced account security.
          </Text>

          <TouchableOpacity
            className="w-full bg-[#48AAD9] rounded-xl py-3.5 items-center mb-2.5"
            onPress={onChangePassword}
          >
            <Text className="text-sm" style={styles.primaryButtonText}>
              Change Password
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl py-3.5 items-center"
            onPress={onClose}
          >
            <Text className="text-sm" style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FirstTimePasswordModal;

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Poppins-Bold',
    color: '#333333',
    includeFontPadding: false,
  },
  message: {
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    includeFontPadding: false,
  },
  primaryButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#DC2626',
    includeFontPadding: false,
  },
});
