import { Text, View, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import LogoutIcon from '@assets/icons/account/logout.svg';

export default function LogoutConfirmationOverlay({ visible, onClose, onConfirm, loading }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-8" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6 w-full items-center shadow-xl" onPress={(e) => e.stopPropagation()}>
          <Text className="text-xl mb-2 text-center" style={styles.titleFont}>Log Out</Text>
          <Text className="text-sm text-center mb-6 leading-5" style={styles.messageFont}>
            Are you sure you want to log out of your account?
          </Text>

          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-3.5 items-center bg-[#FEF2F2] border border-[#FCA5A5]"
              onPress={onClose}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text className="text-sm" style={styles.cancelBtnFont}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl py-3.5 items-center bg-[#48AAD9]"
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text className="text-sm text-white" style={styles.confirmBtnFont}>
                {loading ? 'Logging out...' : 'Log Out'}
              </Text>
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
    color: '#444444',
    includeFontPadding: false,
  },
  messageFont: {
    fontFamily: 'Poppins-Regular',
    color: '#444444',
    includeFontPadding: false,
  },
  cancelBtnFont: {
    fontFamily: 'Poppins-SemiBold',
    color: '#DC2626',
    includeFontPadding: false,
  },
  confirmBtnFont: {
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
