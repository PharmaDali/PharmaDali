import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Pressable } from 'react-native';
import React, { useState } from 'react';
import { colors } from '@shared/theme/colorPalette';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

export default function IssueOrderCard({ order, onOutPending }) {
  const [expanded, setExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const issueItems = order.items.filter((item) => 
    item.status === 'Rejected' || 
    item.status === 'Pending' || 
    item.status === 'stand_by' ||
    item.status === 'Awaiting Customer Response'
  );
  const rejectedItems = order.items.filter((item) => item.status === 'Rejected');
  const pendingItems = order.items.filter((item) => item.status === 'Pending');
  const standbyItems = order.items.filter((item) => item.status === 'stand_by' || item.status === 'Awaiting Customer Response');
  
  const prescriptionItem = order.items?.find((item) => item.prescriptionImage);
  const prescriptionImage = prescriptionItem?.prescriptionImage || (order.prescriptionImage ? (typeof order.prescriptionImage === 'string' ? { uri: order.prescriptionImage } : order.prescriptionImage) : null);

  const isDiscountIssue = Boolean(order.discountRemarks?.toLowerCase().includes('rejected') || (order.cancellationReason?.toLowerCase().includes('discount') && !order.cancellationReason?.toLowerCase().includes('prescription')));
  const isReceiptIssue = Boolean(order.note?.toLowerCase().includes('receipt') || order.paymentStatus === 'failed' || order.cancellationReason?.toLowerCase().includes('receipt'));

  const discountIdImage = order.discountIdImagePath ? { uri: order.discountIdImagePath } : null;
  const paymentReceiptImage = order.paymentReceiptImagePath ? { uri: order.paymentReceiptImagePath } : null;

  const issueCount = issueItems.length;

  const isRejectedByPharmacist = order.apiStatus === 'cancelled' && order.cancellationReason?.toLowerCase().includes('rejected by pharmacist');
  const isRejected = isRejectedByPharmacist || order.apiStatus === 'rejected';

  let issueSummary = '';
  if (issueCount === 1) {
    issueSummary = '1 item has issues';
  } else if (issueCount > 1) {
    issueSummary = `${issueCount} items have issues`;
  } else if (isRejected) {
    issueSummary = 'Order rejected';
  } else if (order.apiStatus === 'cancelled') {
    issueSummary = 'Order cancelled';
  } else {
    issueSummary = 'Order requires attention';
  }

  const rawReason = order.cancellationReason || rejectedItems.find((i) => i.rejectionReason && i.rejectionReason !== 'Requires attention')?.rejectionReason || '';
  const cleanReason = rawReason
    .replace(/^rejected by pharmacist:\s*/i, '')
    .replace(/^cancelled by customer:\s*/i, '')
    .replace(/^prescription rejected:\s*/i, '')
    .trim();
  const displayReason = cleanReason || rawReason;

  const statusBadge = order.apiStatus === 'cancelled' || order.apiStatus === 'rejected' ? (
    <View className="px-3 py-1 rounded-lg border" style={isRejected ? styles.rejectedBadge : styles.cancelledBadge}>
      <Text className="text-xs" style={isRejected ? styles.rejectedText : styles.cancelledText}>
        {isRejected ? 'Rejected' : 'Cancelled'}
      </Text>
    </View>
  ) : (
    <View className="px-3 py-1 rounded-lg border" style={styles.awaitingBadge}>
      <Text className="text-xs" style={styles.awaitingText}>Awaiting Customer Action</Text>
    </View>
  );

  const isStandBy = order.apiStatus === 'stand_by' || order.apiStatus === 'pending';

  return (
    <OrderCard order={order} statusBadge={statusBadge}>
      <View className="px-4 pb-2 flex-row justify-between items-center">
        <Text className="text-xs flex-1 mr-2" style={{ fontFamily: 'Poppins-Medium', color: colors.textColor }}>
          {issueSummary}
        </Text>
        {isStandBy && (
          <TouchableOpacity
            className="rounded-xl px-4 py-1.5"
            style={{ backgroundColor: '#48AAD9' }}
            onPress={() => onOutPending?.(order)}
          >
            <Text className="text-xs text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
              Out Pending
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!expanded ? (
        <View className="items-end px-4 pb-4">
          <TouchableOpacity
            className="flex-row items-center rounded-xl px-5 py-2"
            style={{ backgroundColor: colors.buttonColor }}
            onPress={() => setExpanded(true)}
          >
            <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
              View details
            </Text>
            <View className="ml-2">
              <ArrowDownIcon width={12} height={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {/* Rejection / Cancellation Reason (Only displayed when card expands) */}
          {Boolean(displayReason) && (
            <View
              className="mx-4 mt-2 mb-2 p-3 rounded-xl border"
              style={isRejected ? styles.reasonBoxRejected : styles.reasonBoxCancelled}
            >
              <Text
                className="text-xs mb-1"
                style={isRejected ? styles.rejectionReasonTitle : styles.cancellationReasonTitle}
              >
                {isRejected ? 'Rejection Reason' : 'Cancellation Reason'}
              </Text>
              <Text className="text-xs leading-5" style={{ fontFamily: 'Poppins-Regular', color: colors.textColor }}>
                {displayReason}
              </Text>
            </View>
          )}

          {/* Prescription Photo */}
          {prescriptionImage && (
            <View className="px-4 border-t border-gray-100 py-3">
              <Text className="text-sm mb-2" style={styles.sectionTitle}>Prescription Photo</Text>
              <TouchableOpacity
                className="rounded-xl overflow-hidden border border-gray-200"
                activeOpacity={0.8}
                onPress={() => setPreviewImage(prescriptionImage)}
              >
                <Image
                  source={prescriptionImage}
                  className="w-full h-40"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Discount ID Photo (if discount issue or no prescription photo) */}
          {discountIdImage && (isDiscountIssue || !prescriptionImage) && (
            <View className="px-4 border-t border-gray-100 py-3">
              <Text className="text-sm mb-2" style={styles.sectionTitle}>Discount ID Photo ({order.discountType || 'Senior/PWD'})</Text>
              <TouchableOpacity
                className="rounded-xl overflow-hidden border border-gray-200"
                activeOpacity={0.8}
                onPress={() => setPreviewImage(discountIdImage)}
              >
                <Image
                  source={discountIdImage}
                  className="w-full h-40"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Customer Uploaded / Re-uploaded Payment Receipt Photo */}
          {paymentReceiptImage && (
            <View className="px-4 border-t border-gray-100 py-3">
              <Text className="text-sm mb-2" style={styles.sectionTitle}>Payment Receipt Photo</Text>
              <TouchableOpacity
                className="rounded-xl overflow-hidden border border-gray-200"
                activeOpacity={0.8}
                onPress={() => setPreviewImage(paymentReceiptImage)}
              >
                <Image
                  source={paymentReceiptImage}
                  className="w-full h-40"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          )}

          {rejectedItems.length > 0 && (
            <View className="px-4 border-t border-gray-100">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>Rejected Items</Text>
              {rejectedItems.map((item, idx) => (
                <View key={idx}>
                  <OrderItemRow item={item} />
                </View>
              ))}
            </View>
          )}

          {pendingItems.length > 0 && (
            <View className="px-4 border-t border-gray-100">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>Pending Items</Text>
              {pendingItems.map((item, idx) => (
                <View key={idx}>
                  <OrderItemRow item={item} />
                </View>
              ))}
            </View>
          )}

          {standbyItems.length > 0 && (
            <View className="px-4 border-t border-gray-100">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>Stand-by Items (OTC)</Text>
              {standbyItems.map((item, idx) => (
                <View key={idx}>
                  <OrderItemRow item={item} />
                </View>
              ))}
            </View>
          )}

          <View className="flex-row justify-between items-center px-4 py-3 border-t border-gray-100">
            <Text className="text-sm" style={styles.sectionTitle}>Order Summary</Text>
            <Text className="text-base" style={styles.totalPrice}>PHP {order.orderTotal}</Text>
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

      {previewImage && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setPreviewImage(null)}>
            <Image source={previewImage} style={{ width: '90%', height: '80%', resizeMode: 'contain' }} />
          </Pressable>
        </Modal>
      )}
    </OrderCard>
  );
}

const styles = StyleSheet.create({
  awaitingBadge: {
    borderColor: '#48AAD9',
    backgroundColor: '#EAF6FC',
  },
  awaitingText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#0C5460',
  },
  rejectedBadge: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  rejectedText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#991B1B',
  },
  cancelledBadge: {
    borderColor: '#9CA3AF',
    backgroundColor: '#F3F4F6',
  },
  cancelledText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#4B5563',
  },
  reasonBoxRejected: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  reasonBoxCancelled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  rejectionReasonTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#991B1B',
  },
  cancellationReasonTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#4B5563',
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
