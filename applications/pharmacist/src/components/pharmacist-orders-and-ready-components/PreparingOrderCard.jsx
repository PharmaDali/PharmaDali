import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { colors } from '@shared/theme/colorPalette';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DISCOUNT_TYPE_LABELS = {
  senior_citizen: 'Senior Citizen',
  pwd: 'PWD',
};

export default function PreparingOrderCard({ order, onMarkAsReady }) {
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <OrderCard order={order}>
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
        <Text className="text-base" style={styles.totalPrice}>PHP {order.orderTotal}</Text>
      </View>

      <View className="items-end px-4 pb-4">
        <TouchableOpacity
          className="rounded-xl px-6 py-2"
          style={{ backgroundColor: colors.buttonColor }}
          onPress={() => onMarkAsReady?.(order)}
        >
          <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
            Mark as ready
          </Text>
        </TouchableOpacity>
      </View>

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
});
