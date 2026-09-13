import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DeleteConversationOverlay({
  visible,
  conversation,
  onClose,
  onConfirm,
  loading = false,
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-2xl p-4 w-full max-w-[280px] items-center shadow-xl"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-100 items-center justify-center mb-2">
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color="#EF4444"
            />
          </View>

          <Text className="text-[15px] text-slate-800 mb-1 text-center" style={styles.titleFont}>
            Delete Conversation
          </Text>

          <Text className="text-[11.5px] text-slate-500 text-center mb-4 leading-4" style={styles.messageFont}>
            Delete this conversation? You can undo this action.
          </Text>

          <View className="flex-row w-full gap-2.5">
            <TouchableOpacity
              className="flex-1 rounded-lg py-2 items-center border border-slate-200 bg-slate-50"
              onPress={onClose}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text className="text-[11.5px] text-slate-600" style={styles.btnCancelFont}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg py-2 items-center bg-[#EF4444]"
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text className="text-[11.5px] text-white" style={styles.btnDeleteFont}>
                {loading ? 'Deleting...' : 'Delete'}
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
    fontFamily: 'Poppins-Regular',
  },
  btnCancelFont: {
    fontFamily: 'Poppins-SemiBold',
  },
  btnDeleteFont: {
    fontFamily: 'Poppins-Bold',
  },
});

