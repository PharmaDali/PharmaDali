import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@shared/theme/colorPalette';
import RxIcon from '@assets/icons/rx_icon.svg';
import InfoIcon from '@assets/icons/red_info_icon.svg';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DISCOUNT_TYPE_LABELS = {
  senior_citizen: 'Senior Citizen',
  pwd: 'PWD',
  employee: 'Employee',
  student: 'Student',
  diplomat: 'Diplomat',
};

export default function ReviewOrderCard({ order, onApprove, onReject, onPending, muteActions = false }) {
  const [expanded, setExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [rememberDiscount, setRememberDiscount] = useState(true);

  const hasPrescription = order.items.some((item) => item.prescriptionRequired);
  const otcItems = order.items.filter((item) => !item.prescriptionRequired);
  const rxItems = order.items.filter((item) => item.prescriptionRequired);
  const prescriptionImage = rxItems.find(item => item.prescriptionImage)?.prescriptionImage;

  const hasAcknowledgedDiscount = order.discountRemarks?.toLowerCase()?.startsWith('acknowledged_rejected:');

  const isAwaitingCustomerAcknowledgement = 
    (order.discountRemarks?.toLowerCase()?.startsWith('rejected:') && !hasAcknowledgedDiscount) || 
    (order.paymentStatus === 'failed' && order.note?.toLowerCase()?.includes('payment receipt rejected:'));
  
  const effectiveMuteActions = muteActions || isAwaitingCustomerAcknowledgement;

  let statusBadge = null;
  if (isAwaitingCustomerAcknowledgement) {
    statusBadge = (
      <View className="px-2 py-0.5 rounded-lg border" style={{ borderColor: '#E67E22', backgroundColor: '#FFF4E5' }}>
        <Text className="text-[10px]" style={{ fontFamily: 'Poppins-SemiBold', color: '#D35400' }}>Awaiting Acknowledgement</Text>
      </View>
    );
  }

  return (
    <OrderCard order={order} statusBadge={statusBadge}>
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
          {/* OTC Items and Summary for Non-RX orders when expanded */}
          {rxItems.length === 0 && (
            <View className="px-4 border-t border-gray-100 mb-3">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>Order Items</Text>
              {otcItems.map((item, idx) => (
                <OrderItemRow key={idx} item={item} />
              ))}

              <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100 mb-2">
                <Text className="text-sm text-gray-500" style={{ fontFamily: 'Poppins-Medium' }}>Total</Text>
                <Text className="text-base text-gray-900" style={{ fontFamily: 'Poppins-SemiBold' }}>PHP {order.orderTotal}</Text>
              </View>

              <View className="flex-row justify-end gap-2 mt-2 mb-2">
                <TouchableOpacity
                  className="rounded-xl px-5 py-1.5"
                  style={effectiveMuteActions ? styles.mutedPendingButton : styles.pendingButton}
                  disabled={effectiveMuteActions}
                  onPress={() => onPending?.(order)}
                >
                  <Text className="text-sm" style={effectiveMuteActions ? styles.mutedPendingText : styles.pendingText}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-xl px-5 py-1.5"
                  style={effectiveMuteActions ? styles.mutedApproveButton : styles.discountApproveButton}
                  disabled={effectiveMuteActions}
                  onPress={() => onApprove?.(order)}
                >
                  <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-xl px-4 py-1.5 border"
                  style={effectiveMuteActions ? styles.mutedRejectButton : styles.discountRejectButton}
                  disabled={effectiveMuteActions}
                  onPress={() => onReject?.(order)}
                >
                  <Text className="text-sm" style={effectiveMuteActions ? styles.mutedRejectText : styles.discountRejectText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Rx Items/Approval Section */}
          {rxItems.length > 0 && (
            <View className="mx-2 mb-4 mt-2">
              {/* OTC Items within an RX order (No BG) */}
              {otcItems.length > 0 && (
                <View className="px-2 mb-2">
                  <Text className="text-sm" style={styles.sectionTitle}>OTC Items</Text>
                  {otcItems.map((item, idx) => (
                    <OrderItemRow key={idx} item={item} />
                  ))}
                </View>
              )}

              {/* Approval Box (With BG) */}
              <View className="p-3 rounded-2xl" style={{ backgroundColor: '#EBF3F7' }}>
                <Text className="text-sm mt-1" style={styles.sectionTitle}>Requires Approval</Text>
                {rxItems.map((item, idx) => (
                  <View key={idx}>
                    <OrderItemRow item={item} />
                  </View>
                ))}

                {prescriptionImage && (
                  <View className="flex-row items-center gap-3 mt-3">
                    <TouchableOpacity
                      className="flex-1 rounded-lg overflow-hidden border border-gray-200"
                      activeOpacity={0.8}
                      onPress={() => setPreviewImage(prescriptionImage)}
                    >
                      <Image
                        source={prescriptionImage}
                        className="w-full h-32"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>

                    <View className="gap-2">
        
                      <TouchableOpacity
                        className="rounded-xl px-6 py-2"
                        style={effectiveMuteActions ? styles.mutedPendingButton : styles.pendingButton}
                        disabled={effectiveMuteActions}
                        onPress={() => onPending?.(order)}
                      >
                        <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>Pending</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded-xl px-6 py-2"
                        style={effectiveMuteActions ? styles.mutedApproveButton : styles.discountApproveButton}
                        disabled={effectiveMuteActions}
                        onPress={() => onApprove?.(order)}
                      >
                        <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded-xl px-6 py-2 border"
                        style={effectiveMuteActions ? styles.mutedRejectButton : styles.discountRejectButton}
                        disabled={effectiveMuteActions}
                        onPress={() => onReject?.(order, 'prescription')}
                      >
                        <Text className="text-sm" style={effectiveMuteActions ? styles.mutedRejectText : styles.discountRejectText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {!prescriptionImage && (
                  <View className="mt-2">
      
                    <View className="flex-row justify-end gap-2 mb-2">
                      <TouchableOpacity
                        className="rounded-xl px-5 py-1.5"
                        style={effectiveMuteActions ? styles.mutedPendingButton : styles.pendingButton}
                        disabled={effectiveMuteActions}
                      onPress={() => onPending?.(order)}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-sm" style={effectiveMuteActions ? styles.mutedPendingText : styles.pendingText}>Pending</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-xl px-5 py-1.5"
                      style={effectiveMuteActions ? styles.mutedApproveButton : styles.discountApproveButton}
                      disabled={effectiveMuteActions}
                      onPress={() => onApprove?.(order)}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>Approve</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="rounded-xl px-4 py-1.5 border"
                      style={effectiveMuteActions ? styles.mutedRejectButton : styles.discountRejectButton}
                      disabled={effectiveMuteActions}
                      onPress={() => onReject?.(order, 'prescription')}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-sm" style={effectiveMuteActions ? styles.mutedRejectText : styles.discountRejectText}>Reject</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Discount ID Approval Section */}
          {order.discountIdImagePath && (() => {
            const isDiscountRejected = order.discountRemarks?.toLowerCase().includes('rejected');
            const isDiscountApproved = order.discountRemarks?.toLowerCase() === 'approved';
            return (
            <View className="mx-2 mb-4 mt-2">
              <View className="p-3 rounded-2xl overflow-hidden" style={{ backgroundColor: '#EBF3F7' }}>
                <Text className="text-sm mb-3" style={styles.sectionTitle}>
                  {order.discountType ? `Discount (${DISCOUNT_TYPE_LABELS[order.discountType] ?? order.discountType})` : 'Discount ID'}
                </Text>

                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    className="flex-1 rounded-lg overflow-hidden border border-gray-300 relative"
                    activeOpacity={0.8}
                    onPress={() => setPreviewImage({ uri: order.discountIdImagePath })}
                  >
                    <Image
                      source={{ uri: order.discountIdImagePath }}
                      className="w-full h-24"
                      resizeMode="cover"
                    />

                    {isDiscountRejected && (
                      <View className="absolute inset-0 z-10 items-center justify-center px-4" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                        <Text className="text-[#DC3545] text-base mb-1" style={{ fontFamily: 'Poppins-Bold' }}>ID Rejected</Text>
                        <Text className="text-gray-600 text-[10px] text-center" style={{ fontFamily: 'Poppins-Medium' }}>
                          Customer has been notified to bring physical ID.
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {isDiscountApproved ? (
                    <View className="gap-2 items-center justify-center bg-[#E8F5E9] px-4 py-2 rounded-xl border border-[#C8E6C9]">
                      <Text className="text-[#2E7D32] text-xs text-center" style={{ fontFamily: 'Poppins-Bold' }}>✓ Approved</Text>
                    </View>
                  ) : !isDiscountRejected ? (
                    <View className="gap-2">
                      <TouchableOpacity
                        className="rounded-xl px-6 py-2"
                        style={styles.discountApproveButton}
                        disabled={muteActions}
                        onPress={() => onApprove?.(order, 'discount')}
                      >
                        <Text className="text-sm text-white text-center" style={{ fontFamily: 'Poppins-SemiBold' }}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded-xl px-6 py-2 border"
                        style={styles.discountRejectButton}
                        disabled={muteActions}
                        onPress={() => onReject?.(order, 'discount')}
                      >
                        <Text className="text-sm text-center" style={styles.discountRejectText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                {/* Checkbox */}
                {!isDiscountRejected && (
                  <TouchableOpacity 
                    className="flex-row items-center mt-4 mb-1" 
                    activeOpacity={0.7}
                    onPress={() => setRememberDiscount(!rememberDiscount)}
                  >
                    <View className="w-5 h-5 rounded-md items-center justify-center mr-3" style={{ backgroundColor: rememberDiscount ? '#48AAD9' : '#FFFFFF', borderColor: '#48AAD9', borderWidth: 1.5 }}>
                      {rememberDiscount && (
                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <Path d="M5 13l4 4L19 7" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                      )}
                    </View>
                    <Text className="text-xs text-gray-700" style={{ fontFamily: 'Poppins-Medium' }}>Remember this ID for future orders</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            );
          })()}

          {/* Payment Receipt Section */}
          {order.paymentReceiptImagePath && (() => {
            const isReceiptRejected = order.paymentStatus === 'failed';
            const isReceiptApproved = order.paymentStatus === 'paid';
            return (
            <View className="mx-2 mb-4 mt-2">
              <View className="p-3 rounded-2xl overflow-hidden" style={{ backgroundColor: '#EBF3F7' }}>
                <Text className="text-sm mb-3" style={styles.sectionTitle}>Payment Receipt</Text>

                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    className="flex-1 rounded-lg overflow-hidden border border-gray-300 relative"
                    activeOpacity={0.8}
                    onPress={() => setPreviewImage({ uri: order.paymentReceiptImagePath })}
                  >
                    <Image
                      source={{ uri: order.paymentReceiptImagePath }}
                      className="w-full h-28"
                      resizeMode="cover"
                    />

                    {isReceiptRejected && (
                      <View className="absolute inset-0 z-10 items-center justify-center px-4" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                        <Text className="text-[#DC3545] text-base mb-1" style={{ fontFamily: 'Poppins-Bold' }}>Receipt Rejected</Text>
                        <Text className="text-gray-600 text-[10px] text-center" style={{ fontFamily: 'Poppins-Medium' }}>
                          Customer notified to pay upon pickup.
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {isReceiptApproved ? (
                    <View className="gap-2 items-center justify-center bg-[#E8F5E9] px-4 py-2 rounded-xl border border-[#C8E6C9]">
                      <Text className="text-[#2E7D32] text-xs text-center" style={{ fontFamily: 'Poppins-Bold' }}>✓ Approved</Text>
                    </View>
                  ) : !isReceiptRejected ? (
                    <View className="gap-2">
                      <TouchableOpacity
                        className="rounded-xl px-6 py-2"
                        style={styles.discountApproveButton}
                        disabled={muteActions}
                        onPress={() => onApprove?.(order, 'receipt')}
                      >
                        <Text className="text-sm text-white text-center" style={{ fontFamily: 'Poppins-SemiBold' }}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="rounded-xl px-6 py-2 border"
                        style={styles.discountRejectButton}
                        disabled={muteActions}
                        onPress={() => onReject?.(order, 'receipt')}
                      >
                        <Text className="text-sm text-center" style={styles.discountRejectText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
            );
          })()}

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
  otpText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#EAB308',
  },
  pendingButton: {
    backgroundColor: '#EAB308',
  },
  pendingText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  approveButton: {
    backgroundColor: '#22C55E',
  },
  approveText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  rejectButton: {
    borderColor: '#DC3545',
    backgroundColor: 'transparent',
  },
  rejectText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#DC3545',
  },
  discountApproveButton: {
    backgroundColor: '#48AAD9',
  },
  discountRejectButton: {
    borderColor: '#DC3545',
    backgroundColor: '#FFF0F0',
  },
  discountRejectText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#DC3545',
  },
  mutedPendingButton: {
    backgroundColor: '#D8DDE3',
    borderColor: '#D8DDE3',
  },
  mutedPendingText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#7A8594',
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
