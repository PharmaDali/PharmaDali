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

  let issueSummary = '';
  if (issueCount === 1) {
    const item = issueItems[0];
    issueSummary = `1 item ${item.status.toLowerCase()}: ${item.rejectionReason || 'Requires attention'}`;
  } else {
    issueSummary = `${issueCount} items have issues`;
  }

  const isRejectedByPharmacist = order.apiStatus === 'cancelled' && order.cancellationReason?.toLowerCase().includes('rejected by pharmacist');

  const statusBadge = order.apiStatus === 'cancelled' || order.apiStatus === 'rejected' ? (
    <View className="px-3 py-1 rounded-lg border" style={styles.rejectedBadge}>
      <Text className="text-xs" style={styles.rejectedText}>
        {isRejectedByPharmacist ? 'Rejected' : 'Cancelled'}
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
                  {item.rejectionReason && (
                    <Text className="text-xs mb-2" style={{ fontFamily: 'Poppins-Medium', color: colors.accent }}>
                      Reason: {item.rejectionReason}
                    </Text>
                  )}
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
                  {item.rejectionReason && (
                    <Text className="text-xs mb-2" style={{ fontFamily: 'Poppins-Medium', color: '#FFC107' }}>
                      Reason: {item.rejectionReason}
                    </Text>
                  )}
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
    borderColor: '#CC3A3A',
    backgroundColor: '#FCEAEA',
  },
  rejectedText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#CC3A3A',
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
