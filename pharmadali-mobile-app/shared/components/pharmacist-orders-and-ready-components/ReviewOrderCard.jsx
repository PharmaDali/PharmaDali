import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { colors } from '@shared/colorPallete';
import RxIcon from '@assets/icons/rx_icon.svg';
import SuccessIcon from '@assets/icons/success_icon.svg';
import InfoIcon from '@assets/icons/red_info_icon.svg';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReviewOrderCard({ order, onApprove, onReject, muteActions = false }) {
  const [expanded, setExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const hasPrescription = order.items.some((item) => item.prescriptionRequired);
  const otcItems = order.items.filter((item) => !item.prescriptionRequired);
  const rxItems = order.items.filter((item) => item.prescriptionRequired);

  return (
    <OrderCard order={order}>
      {!expanded ? (
        <View className="flex-row items-center justify-between px-4 pb-4 pt-2">
          {hasPrescription && (
            <View className="flex-row items-center border rounded-full px-3 py-1.5" style={styles.rxBadge}>
              <RxIcon width={16} height={16} />
              <Text className="text-xs ml-1.5" style={styles.rxText}>Has prescription</Text>
            </View>
          )}
          <TouchableOpacity
            className="flex-row items-center rounded-xl px-5 py-2 ml-auto"
            style={{ backgroundColor: colors.buttonColor }}
            onPress={() => setExpanded(true)}
          >
            <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
              Review order
            </Text>
            <View className="ml-2">
              <ArrowDownIcon width={12} height={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* OTC Items */}
          {otcItems.length > 0 && (
            <View className="px-4 border-t border-gray-100">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>OTC Items</Text>
              {otcItems.map((item, idx) => (
                <OrderItemRow key={idx} item={item} />
              ))}
            </View>
          )}

          {rxItems.length > 0 && (
            <View className="px-4 border-t border-gray-100 mt-1">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>Requires Approval</Text>
              {rxItems.map((item, idx) => (
                <View key={idx}>
                  <OrderItemRow item={item} />

                  {item.prescriptionImage && (
                    <TouchableOpacity
                      className="rounded-lg overflow-hidden border border-gray-200 mb-2"
                      activeOpacity={0.8}
                      onPress={() => setPreviewImage(item.prescriptionImage)}
                    >
                      <Image
                        source={item.prescriptionImage}
                        className="w-full h-28"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}

                  <View className="flex-row justify-end gap-2 mb-3">
                    <TouchableOpacity
                      className="rounded-xl px-5 py-1.5"
                      style={muteActions ? styles.mutedApproveButton : styles.approveButton}
                      disabled={muteActions}
                      onPress={() => onApprove?.(order, item)}
                    >
                      <View className="flex-row items-center">                       
                        <Text className="text-sm" style={muteActions ? styles.mutedApproveText : styles.approveText}>Approve</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-xl px-5 py-1.5 border"
                      style={muteActions ? styles.mutedRejectButton : styles.rejectButton}
                      disabled={muteActions}
                      onPress={() => onReject?.(order, item)}
                    >
                      <View className="flex-row items-center">          
                        <Text className="text-sm" style={muteActions ? styles.mutedRejectText : styles.rejectText}>Reject</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View className="flex-row justify-between items-center px-4 py-3 border-t border-gray-100">
            <Text className="text-sm" style={styles.sectionTitle}>Order Summary</Text>
            <Text className="text-base" style={styles.totalPrice}>₱ {order.orderTotal}</Text>
          </View>

          <View className="items-center pb-3">
            <TouchableOpacity
              className="flex-row items-center rounded-xl px-5 py-2"
              style={{ backgroundColor: colors.buttonColor }}
              onPress={() => setExpanded(false)}
            >
              <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Collapse
              </Text>
              <View className="ml-2">
                <ArrowUpIcon width={12} height={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={!!previewImage} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <TouchableOpacity
          className="flex-1 items-center justify-center"
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          <Image
            source={previewImage}
            style={{ width: screenWidth * 0.9, height: screenHeight * 0.7 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </OrderCard>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  rxBadge: {
    borderColor: '#E8A0A0',
    backgroundColor: '#FFF0F0',
  },
  rxText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#DC3545',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  approveText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  rejectButton: {
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  rejectText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.accent,
  },
  mutedApproveButton: {
    backgroundColor: '#D8DDE3',
    borderColor: '#D8DDE3',
  },
  mutedApproveText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#7A8594',
  },
  mutedRejectButton: {
    borderColor: '#D8DDE3',
    backgroundColor: '#F3F5F7',
  },
  mutedRejectText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#7A8594',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
});
