import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@shared/theme/colorPalette';

const ACTION_CONFIG = {
  approve: {
    title: 'Order Approved',
    icon: 'checkmark-circle-outline',
    iconColor: '#10B981',
    bgColor: '#ECFDF5',
    instruction: 'Order approved successfully! Please proceed to the Preparing tab to assemble the items.',
  },
  ready: {
    title: 'Order Prepared',
    icon: 'cube-outline',
    iconColor: colors.buttonColor || '#48AAD9',
    bgColor: '#F0F9FF',
    instruction: 'Order is prepared! Please proceed to the Ready tab for customer pickup.',
  },
  pending: {
    title: 'Order Placed on Hold',
    icon: 'time-outline',
    iconColor: '#F59E0B',
    bgColor: '#FFFBEB',
    instruction: 'Order has been placed on hold. Please check your chat with the customer for details.',
  },
  reject: {
    title: 'Order Rejected',
    icon: 'close-circle-outline',
    iconColor: '#EF4444',
    bgColor: '#FEF2F2',
    instruction: 'Order has been rejected and the customer has been notified.',
  },
  complete: {
    title: 'Pickup Completed',
    icon: 'checkmark-done-circle-outline',
    iconColor: '#10B981',
    bgColor: '#ECFDF5',
    instruction: 'Order completed successfully! Stock and customer pickup records have been updated.',
  },
};

export default function StatusFeedbackModal({ visible, onClose, actionType }) {
  const config = ACTION_CONFIG[actionType] || ACTION_CONFIG.approve;

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Status Icon */}
              <View style={[styles.iconWrap, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon} size={48} color={config.iconColor} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{config.title}</Text>

              {/* Instructions */}
              <Text style={styles.instruction}>{config.instruction}</Text>

              <Text style={styles.tapHint}>Tap anywhere to dismiss</Text>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  tapHint: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
  },
});
