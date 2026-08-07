import { Text, View, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LogoutConfirmationOverlay({ visible, onClose, onConfirm, loading }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-8" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6 w-full items-center shadow-xl" onPress={(e) => e.stopPropagation()}>
          <View className="w-16 h-16 rounded-full bg-red-50 border-4 border-red-200 items-center justify-center mb-4">
            <MaterialCommunityIcons name="logout" size={30} color="#EF4444" />
          </View>

          <Text className="text-xl mb-2 text-slate-800" style={styles.titleFont}>Log Out</Text>
          <Text className="text-sm text-center mb-6" style={styles.messageFont}>
            Are you sure you want to log out of your account?
          </Text>

          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center border border-slate-200 bg-gray-50"
              onPress={onClose}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text className="text-sm text-slate-700" style={styles.btnFont}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 items-center bg-red-500 active:bg-red-600"
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text className="text-sm text-white" style={styles.btnFont}>
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
  },
  messageFont: {
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  btnFont: {
    fontFamily: 'Poppins-SemiBold',
  },
});
