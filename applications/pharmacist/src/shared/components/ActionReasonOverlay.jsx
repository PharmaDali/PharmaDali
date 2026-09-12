import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import { Ionicons } from '@expo/vector-icons';

const REJECT_REASONS_GENERAL = [
  'Invalid Prescription - Please re-order OTC items separately',
  'Fake or Expired Prescription',
  'Mismatched Patient Information',
  'Product Out of Stock',
  'Incorrect Item Information',
];

const REJECT_REASONS_DISCOUNT = [
  'Invalid or Unrecognized ID',
  'Expired Discount ID',
  'ID Details Do Not Match Patient',
  'Blurry or Unreadable ID Photo',
];

const REJECT_REASONS_RECEIPT = [
  'Invalid Payment Receipt',
  'Amount Does Not Match Order Total',
  'Reference Number Not Found',
  'Blurry or Unreadable Receipt Photo',
];

const PENDING_REASONS = [
  'Invalid Prescription - OTC items ready (Awaiting new Rx)',
  'Blurry Prescription - Please re-upload clear photo',
  'Prescription Name Mismatch - Awaiting clarification',
  'Verifying Prescription with Physician',
  'Waiting for Stock Arrival',
];

export default function ActionReasonOverlay({
  visible,
  onClose,
  onSubmit,
  actionType, // 'reject' or 'pending'
  section,    // 'discount', 'receipt', or null
}) {
  const [reason, setReason] = useState('');
  const [selectedPrewritten, setSelectedPrewritten] = useState('');

  const isReject = actionType === 'reject';
  
  let title = isReject ? 'Reject Order' : 'Place on Hold';
  if (isReject) {
    if (section === 'discount') title = 'Reject Discount ID';
    else if (section === 'receipt') title = 'Reject Payment Receipt';
    else if (section === 'prescription') title = 'Reject Prescription';
  }

  let options = PENDING_REASONS;
  if (isReject) {
    if (section === 'discount') options = REJECT_REASONS_DISCOUNT;
    else if (section === 'receipt') options = REJECT_REASONS_RECEIPT;
    else options = REJECT_REASONS_GENERAL;
  }

  const themeColor = isReject ? '#DC3545' : '#EAB308'; // Red for reject, Yellow for pending

  const handleSelectOption = (opt) => {
    setSelectedPrewritten(opt);
    setReason(opt);
  };

  const handleClear = () => {
    setReason('');
    setSelectedPrewritten('');
  };

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim());
    handleClear();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View className="flex-1 justify-center items-center px-5" style={{ flex: 1 }}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="w-full bg-white rounded-2xl max-h-[72%] overflow-hidden shadow-xl">
                  {/* Header */}
                  <View className="flex-row justify-between items-center px-5 py-3 border-b border-gray-100">
                    <Text className="text-base" style={[{ color: themeColor }, styles.titleFont]}>
                      {title}
                    </Text>
                    <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close" size={22} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    indicatorStyle="black"
                    scrollIndicatorInsets={{ right: 2 }}
                    className="w-full flex-grow-0"
                    contentContainerClassName="px-5 py-3.5"
                    contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text className="text-xs text-gray-500 mb-2" style={styles.labelFont}>
                      Select a reason:
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {options.map((opt) => {
                        const isSelected = selectedPrewritten === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            className={`px-3 py-1.5 rounded-xl border ${
                              isSelected ? '' : 'border-gray-200 bg-gray-50'
                            }`}
                            style={
                              isSelected
                                ? { borderColor: themeColor, backgroundColor: themeColor + '10' }
                                : null
                            }
                            onPress={() => handleSelectOption(opt)}
                            activeOpacity={0.7}
                          >
                            <Text
                              className="text-xs"
                              style={[
                                styles.optionFont,
                                isSelected
                                  ? { color: themeColor, fontFamily: 'Poppins-SemiBold' }
                                  : { color: '#444444' },
                              ]}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text className="text-xs text-gray-500 mt-3 mb-2" style={styles.labelFont}>
                      Or write a custom reason:
                    </Text>
                    <TextInput
                      className="border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50 min-h-[75px]"
                      placeholder="Type reason here..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={3}
                      value={reason}
                      onChangeText={(txt) => {
                        setReason(txt);
                        if (selectedPrewritten !== txt) setSelectedPrewritten('');
                      }}
                      textAlignVertical="top"
                      style={styles.inputFont}
                    />
                  </ScrollView>

                  {/* Footer Actions */}
                  <View className="flex-row p-5 gap-3 border-t border-gray-100">
                    <TouchableOpacity
                      className="flex-1 py-3 items-center rounded-xl bg-gray-100"
                      onPress={onClose}
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm text-gray-500" style={styles.btnFont}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-[2] py-3 items-center rounded-xl ${!reason.trim() ? 'opacity-50' : ''}`}
                      style={{ backgroundColor: themeColor }}
                      onPress={handleSubmit}
                      disabled={!reason.trim()}
                      activeOpacity={0.8}
                    >
                      <Text className="text-sm text-white" style={styles.btnFont}>
                        Confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titleFont: {
    fontFamily: 'Poppins-Bold',
    includeFontPadding: false,
  },
  labelFont: {
    fontFamily: 'Poppins-Medium',
    includeFontPadding: false,
  },
  optionFont: {
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  inputFont: {
    fontFamily: 'Poppins-Regular',
    includeFontPadding: false,
  },
  btnFont: {
    fontFamily: 'Poppins-SemiBold',
    includeFontPadding: false,
  },
});