import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { colors } from '@shared/theme/colorPalette';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const statusConfig = {
  'For Pickup': {
    label: 'Ready',
    borderColor: '#72C1E6',
    backgroundColor: '#E7F5FC',
    textColor: '#3D9BC7',
  },
  Completed: {
    label: 'Completed',
    borderColor: '#93D3A2',
    backgroundColor: '#ECF9F0',
    textColor: '#3F8A56',
  },
  Expired: {
    label: 'Expired',
    borderColor: '#D9A1A1',
    backgroundColor: '#FAEEEE',
    textColor: '#B15A5A',
  },
};

const DISCOUNT_TYPE_LABELS = {
  senior_citizen: 'Senior Citizen',
  pwd: 'PWD',
};

export default function ReadyOrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const isForPickup = order.status === 'For Pickup';
  const status = statusConfig[order.status] ?? statusConfig['For Pickup'];

  const statusBadge = (
    <View
      className="px-3 py-1 rounded-lg border"
      style={{ borderColor: status.borderColor, backgroundColor: status.backgroundColor }}
    >
      <Text className="text-xs" style={{ fontFamily: 'Poppins-SemiBold', color: status.textColor }}>
        {status.label}
      </Text>
    </View>
  );

  return (
    <OrderCard order={order} statusBadge={statusBadge}>
      {!expanded ? (
        <View>
          <View className="items-center pb-4 pt-1">
            <TouchableOpacity
              className="flex-row items-center rounded-xl px-5 py-2 border"
              style={styles.viewMoreButton}
              onPress={() => setExpanded(true)}
            >
              <Text className="text-sm" style={styles.viewMoreText}>View More</Text>
              <View className="ml-2">
                <ArrowDownIcon width={12} height={12} color={colors.buttonColor} />
              </View>
            </TouchableOpacity>
          </View>

          {isForPickup && (
            <View className="px-4 pb-4 pt-1">
              <View 
                className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex-row items-start"
              >
                <Text className="text-[11px] flex-1" style={{ fontFamily: 'Poppins-Medium', color: '#2aabe2' }}>
                  Please complete the checkout for this pickup order in the Admin Web Pickup Orders tab once the customer arrives.
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View>
          <View className="px-4 border-t border-gray-100">
            <Text className="text-sm mt-3" style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item, idx) => (
              <OrderItemRow key={idx} item={item} />
            ))}
          </View>

          {/* Discount ID Approval Section */}
          {order.discountIdImagePath && (() => {
            const isDiscountRejected = order.discountRemarks?.toLowerCase().includes('rejected');
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
                        <Text className="text-[#DC3545] text-[11px] text-center mb-1" style={{ fontFamily: 'Poppins-SemiBold' }}>
                          Reason: {order.discountRemarks?.replace(/^(?:acknowledged_)?rejected(?: by pharmacist)?:\s*/i, '') || 'Rejected'}
                        </Text>
                        <Text className="text-gray-600 text-[10px] text-center" style={{ fontFamily: 'Poppins-Medium' }}>
                          Customer has been notified to bring physical ID.
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            );
          })()}

          {/* Payment Receipt Section */}
          {order.paymentReceiptImagePath && (() => {
            const isReceiptRejected = order.paymentStatus === 'failed';
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
                        <Text className="text-[#DC3545] text-[11px] text-center mb-1" style={{ fontFamily: 'Poppins-SemiBold' }}>
                          Reason: {order.note?.replace(/^(?:customer acknowledged payment issue|payment receipt unverified):\s*/i, '') || 'Rejected'}
                        </Text>
                        <Text className="text-gray-600 text-[10px] text-center" style={{ fontFamily: 'Poppins-Medium' }}>
                          Customer notified to pay upon pickup.
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            );
          })()}

          <View className="flex-row justify-between items-center px-4 py-3 border-t border-gray-100">
            <Text className="text-sm" style={styles.sectionTitle}>Order Summary</Text>
            <Text className="text-base" style={styles.totalPrice}>₱ {order.orderTotal}</Text>
          </View>

          <View className="items-center pb-3">
            <TouchableOpacity
              className="flex-row items-center rounded-xl px-5 py-2 border"
              style={styles.viewMoreButton}
              onPress={() => setExpanded(false)}
            >
              <Text className="text-sm" style={styles.viewMoreText}>Collapse</Text>
              <View className="ml-2">
                <ArrowUpIcon width={12} height={12} color={colors.buttonColor} />
              </View>
            </TouchableOpacity>
          </View>

          {isForPickup && (
            <View className="border-t border-gray-100 pb-4 pt-3 items-center">
              <TouchableOpacity
                className="rounded-xl px-6 py-2"
                style={styles.markCompletedButton}
                onPress={() => onMarkAsCompleted?.(order)}
              >
                <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Mark as Completed
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  viewMoreButton: {
    borderColor: '#89C5E5',
    backgroundColor: '#EEF8FD',
  },
  viewMoreText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
});