import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import { Ionicons } from '@expo/vector-icons';
import RxIcon from '@assets/icons/rx_icon.svg';

export default function ApproveOrderOverlay({
  visible,
  onClose,
  onConfirm,
  order,
  section = null,
  submitting = false,
  errorMessage = '',
}) {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  if (!visible || !order) return null;

  const rxItems = (order.items || []).filter((item) => item.prescriptionRequired);
  const hasPrescription = rxItems.length > 0;
  const prescriptionItem = rxItems.find((item) => item.prescriptionImage);
  const prescriptionImage = prescriptionItem?.prescriptionImage || null;

  const isReuploaded = Boolean(
    order.isPrescriptionReuploaded ||
    rxItems.some((item) => item.isReuploaded) ||
    order.note?.toLowerCase().includes('re-uploaded') ||
    order.note?.toLowerCase().includes('reuploaded')
  );

  const isDiscountSection = section === 'discount';
  const isReceiptSection = section === 'receipt';

  const isGcashUnpaid =
    order.paymentMethod === 'gcash' &&
    order.paymentStatus === 'unpaid' &&
    (!order.discountIdImagePath || order.discountRemarks?.match(/^(approved|rejected|acknowledged_rejected)/i));

  let modalTitle = 'Approve Order';
  if (isDiscountSection) modalTitle = 'Approve Discount ID';
  else if (isReceiptSection) modalTitle = 'Approve Payment Receipt';
  else if (isReuploaded) modalTitle = 'Approve Re-uploaded Rx';
  else if (hasPrescription) modalTitle = 'Approve Order & Rx';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!submitting) onClose();
      }}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              if (!submitting) onClose();
            }}
          >
            <View style={styles.backdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  {/* Header matching app modal design */}
                  <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
                    <View className="flex-1 mr-3">
                      <Text className="text-base text-[#48AAD9]" style={styles.titleFont} numberOfLines={1}>
                        {modalTitle}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5" style={styles.metaFont}>
                        Order #{order.orderNumber}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={onClose}
                      disabled={submitting}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={22} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Scrollable Content */}
                  <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
                    className="w-full flex-grow-0"
                  >
                    {/* Re-uploaded Prescription Alert Banner */}
                    {isReuploaded && (
                      <View className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl p-3.5 mb-3.5">
                        <View className="flex-row items-center mb-1.5">
                          <Ionicons name="refresh-circle" size={18} color="#0284C7" />
                          <Text className="text-xs text-[#0369A1] ml-1.5" style={styles.sectionHeaderFont}>
                            Re-uploaded Prescription
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-700 leading-5" style={styles.bodyFont}>
                          The customer has uploaded a new prescription for this on-hold order. Please verify that the medication, dosage, and patient information match before approving.
                        </Text>
                      </View>
                    )}

                    {/* Standard Prescription Notice if not re-uploaded */}
                    {hasPrescription && !isReuploaded && !isDiscountSection && !isReceiptSection && (
                      <View className="bg-[#EBF3F7] border border-[#D0E3EE] rounded-2xl p-3.5 mb-3.5">
                        <View className="flex-row items-center mb-1.5">
                          <RxIcon width={14} height={14} />
                          <Text className="text-xs text-[#1E3A8A] ml-1.5" style={styles.sectionHeaderFont}>
                            Prescription Verification
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-700 leading-5" style={styles.bodyFont}>
                          Please verify that the prescription image is authentic and covers the prescribed items below before approving.
                        </Text>
                      </View>
                    )}

                    {/* Prescription Photo Preview */}
                    {hasPrescription && prescriptionImage && !isDiscountSection && !isReceiptSection && (
                      <View className="mb-3.5">
                        <Text className="text-xs text-gray-700 mb-1.5" style={styles.labelFont}>
                          Prescription Photo:
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          className="rounded-xl overflow-hidden border border-gray-200 relative"
                          onPress={() => setFullscreenImage(prescriptionImage)}
                        >
                          <Image
                            source={prescriptionImage}
                            className="w-full h-36 bg-gray-100"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-2 right-2 bg-black/60 px-2.5 py-1 rounded-lg flex-row items-center">
                            <Ionicons name="scan-outline" size={12} color="#fff" />
                            <Text className="text-white text-[10px] ml-1" style={styles.metaFont}>
                              Tap to enlarge
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Prescribed Items Summary */}
                    {hasPrescription && !isDiscountSection && !isReceiptSection && (
                      <View className="mb-3.5 bg-gray-50 border border-gray-200 rounded-2xl p-3.5">
                        <Text className="text-xs text-gray-700 mb-2" style={styles.labelFont}>
                          Items Requiring Prescription ({rxItems.length}):
                        </Text>
                        {rxItems.map((item, idx) => (
                          <View key={idx} className="flex-row justify-between items-center py-1.5 border-b border-gray-200 last:border-b-0">
                            <View className="flex-1 mr-2">
                              <Text className="text-xs text-gray-800" style={styles.labelFont} numberOfLines={1}>
                                {item.description}
                              </Text>
                              <Text className="text-[11px] text-gray-500 mt-0.5" style={styles.bodyFont}>
                                Qty: {item.quantity} | {item.sizeLabel}: {item.size}
                              </Text>
                            </View>
                            <Text className="text-xs text-gray-900" style={styles.priceFont}>
                              PHP {item.price}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Discount ID Preview if section === discount */}
                    {isDiscountSection && order.discountIdImagePath && (
                      <View className="mb-3.5">
                        <Text className="text-xs text-gray-700 mb-1.5" style={styles.labelFont}>
                          Discount ID Document:
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          className="rounded-xl overflow-hidden border border-gray-200 relative mb-2"
                          onPress={() => setFullscreenImage({ uri: order.discountIdImagePath })}
                        >
                          <Image
                            source={{ uri: order.discountIdImagePath }}
                            className="w-full h-36 bg-gray-100"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-2 right-2 bg-black/60 px-2.5 py-1 rounded-lg flex-row items-center">
                            <Ionicons name="scan-outline" size={12} color="#fff" />
                            <Text className="text-white text-[10px] ml-1" style={styles.metaFont}>
                              Tap to enlarge
                            </Text>
                          </View>
                        </TouchableOpacity>
                        {!!order.discountType && (
                          <Text className="text-[11px] text-gray-600" style={styles.bodyFont}>
                            Type: <Text style={styles.labelFont}>{order.discountType}</Text>
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Payment Receipt Preview if section === receipt */}
                    {isReceiptSection && order.paymentReceiptImagePath && (
                      <View className="mb-3.5">
                        <Text className="text-xs text-gray-700 mb-1.5" style={styles.labelFont}>
                          Payment Receipt:
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          className="rounded-xl overflow-hidden border border-gray-200 relative mb-2"
                          onPress={() => setFullscreenImage({ uri: order.paymentReceiptImagePath })}
                        >
                          <Image
                            source={{ uri: order.paymentReceiptImagePath }}
                            className="w-full h-36 bg-gray-100"
                            resizeMode="cover"
                          />
                          <View className="absolute bottom-2 right-2 bg-black/60 px-2.5 py-1 rounded-lg flex-row items-center">
                            <Ionicons name="scan-outline" size={12} color="#fff" />
                            <Text className="text-white text-[10px] ml-1" style={styles.metaFont}>
                              Tap to enlarge
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Customer & Order Summary Card */}
                    <View className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200 mb-3.5">
                      <View className="flex-row justify-between py-1 border-b border-gray-100">
                        <Text className="text-xs text-gray-500" style={styles.bodyFont}>Customer</Text>
                        <Text className="text-xs text-gray-800" style={styles.labelFont}>{order.customerName}</Text>
                      </View>
                      <View className="flex-row justify-between py-1 border-b border-gray-100">
                        <Text className="text-xs text-gray-500" style={styles.bodyFont}>Order Total</Text>
                        <Text className="text-sm text-[#48AAD9]" style={styles.totalPriceFont}>PHP {order.orderTotal}</Text>
                      </View>
                      <View className="flex-row justify-between py-1">
                        <Text className="text-xs text-gray-500" style={styles.bodyFont}>Payment Method</Text>
                        <Text className="text-xs text-gray-800" style={styles.labelFont}>
                          {order.paymentMethod === 'gcash' ? 'GCash' : 'Cash on Pickup'} ({order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'})
                        </Text>
                      </View>
                    </View>

                    {/* Next Destination Hint */}
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 mb-1">
                      <Ionicons name="information-circle-outline" size={16} color="#48AAD9" />
                      <Text className="text-[11px] text-gray-600 ml-1.5 flex-1 leading-4" style={styles.bodyFont}>
                        {isGcashUnpaid
                          ? 'Order will transition to Awaiting Payment for GCash settlement.'
                          : isDiscountSection
                          ? 'Approving will apply the verified discount to this order.'
                          : isReceiptSection
                          ? 'Approving will mark the online payment receipt as verified.'
                          : 'Order will transition to Preparing for pharmacy staff to assemble.'}
                      </Text>
                    </View>

                    {/* Error Message */}
                    {!!errorMessage && (
                      <View className="bg-red-50 border border-red-200 rounded-xl p-2.5 mt-2">
                        <Text className="text-xs text-[#DC3545] text-center" style={styles.bodyFont}>
                          {errorMessage}
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* Modal Footer Buttons matching app theme */}
                  <View className="flex-row gap-3 px-5 py-3.5 border-t border-gray-100 bg-white">
                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl border border-gray-300 bg-gray-50 items-center justify-center"
                      onPress={onClose}
                      disabled={submitting}
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm text-gray-700" style={styles.cancelBtnFont}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-1 py-3 rounded-xl bg-[#48AAD9] items-center justify-center"
                      onPress={onConfirm}
                      disabled={submitting}
                      activeOpacity={0.8}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="text-sm text-white" style={styles.confirmBtnFont}>
                          Confirm Approval
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>

      {/* Fullscreen Photo Modal */}
      {fullscreenImage && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setFullscreenImage(null)}>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setFullscreenImage(null)}
          >
            <Image
              source={fullscreenImage}
              style={{ width: '92%', height: '82%', resizeMode: 'contain' }}
            />
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  titleFont: {
    fontFamily: 'Poppins-Bold',
    color: '#48AAD9',
    includeFontPadding: false,
  },
  sectionHeaderFont: {
    fontFamily: 'Poppins-SemiBold',
    includeFontPadding: false,
  },
  labelFont: {
    fontFamily: 'Poppins-SemiBold',
    color: '#444444',
    includeFontPadding: false,
  },
  bodyFont: {
    fontFamily: 'Poppins-Regular',
    color: '#444444',
    includeFontPadding: false,
  },
  metaFont: {
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    includeFontPadding: false,
  },
  priceFont: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
    includeFontPadding: false,
  },
  totalPriceFont: {
    fontFamily: 'Poppins-Bold',
    color: '#48AAD9',
    includeFontPadding: false,
  },
  cancelBtnFont: {
    fontFamily: 'Poppins-SemiBold',
    color: '#555555',
    includeFontPadding: false,
  },
  confirmBtnFont: {
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
});
