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
} from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import { Ionicons } from '@expo/vector-icons';

const REJECT_REASONS = [
  'Invalid Prescription',
  'Incorrect Item Information',
  'Product Out of Stock',
  'Prescription Expired',
  'Mismatched Patient Info',
];

const PENDING_REASONS = [
  'Verifying Prescription',
  'Awaiting Patient Clarification',
  'Waiting for Stock Arrival',
  'Pharmacist on Break',
  'System Verification in Progress',
];

export default function ActionReasonOverlay({
  visible,
  onClose,
  onSubmit,
  actionType, // 'reject' or 'pending'
}) {
  const [reason, setReason] = useState('');
  const [selectedPrewritten, setSelectedPrewritten] = useState('');

  const isReject = actionType === 'reject';
  const title = isReject ? 'Reject Order' : 'Move to Pending';
  const options = isReject ? REJECT_REASONS : PENDING_REASONS;
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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: themeColor }]}>{title}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                <Text style={styles.label}>Select a reason:</Text>
                <View style={styles.optionsWrap}>
                  {options.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.option,
                        selectedPrewritten === opt && {
                          borderColor: themeColor,
                          backgroundColor: themeColor + '10',
                        },
                      ]}
                      onPress={() => handleSelectOption(opt)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedPrewritten === opt && { color: themeColor, fontFamily: 'Poppins-SemiBold' },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { marginTop: 15 }]}>Or write a custom reason:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Type reason here..."
                  multiline
                  numberOfLines={4}
                  value={reason}
                  onChangeText={(txt) => {
                    setReason(txt);
                    if (selectedPrewritten !== txt) setSelectedPrewritten('');
                  }}
                  textAlignVertical="top"
                />
              </ScrollView>

              {/* Footer Actions */}
              <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: themeColor },
                    !reason.trim() && styles.disabledBtn,
                  ]}
                  onPress={handleSubmit}
                  disabled={!reason.trim()}
                >
                  <Text style={styles.submitBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginBottom: 10,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  optionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    minHeight: 100,
    backgroundColor: '#FAFAFA',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  submitBtnText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFF',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});