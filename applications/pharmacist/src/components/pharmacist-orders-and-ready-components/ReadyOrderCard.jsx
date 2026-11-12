import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Dimensions, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
    label: 'Overdue',
    borderColor: 'rgba(255, 178, 89, 0.70)',
    backgroundColor: '#FFF4E5',
    textColor: '#D35400',
  },
};

const DISCOUNT_TYPE_LABELS = {
  senior_citizen: 'Senior Citizen',
  pwd: 'PWD',
};

export default function ReadyOrderCard({ order, onMarkAsCompleted }) {
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
        <View key="collapsed-content" collapsable={false}>
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
            <View key="pickup-info-banner" className="px-4 pb-4 pt-1">
              <View
                className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex-row items-start"
              >
                <Text className="text-[9.5px] flex-1 leading-3.5" style={{ fontFamily: 'Poppins-Medium', color: '#2aabe2', includeFontPadding: false }}>
                  Please complete the checkout for this pickup order in the Admin Web Pickup Orders tab once the customer arrives.
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <View key="expanded-content" collapsable={false}>
          <View key="order-items-section" className="px-4 border-t border-gray-100">
            <Text className="text-sm mt-3" style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item, idx) => (
              <OrderItemRow key={idx} item={item} />
            ))}
          </View>

          {/* Prescription Document Section */}
          {(() => {
            const rxItem = order.items?.find((item) => item.prescriptionImage);
            const prescriptionImage = rxItem?.prescriptionImage || (order.prescriptionImage ? (typeof order.prescriptionImage === 'string' ? { uri: order.prescriptionImage } : order.prescriptionImage) : null);
            if (!prescriptionImage) return null;

            const resolvedSource = typeof prescriptionImage === 'string' ? { uri: prescriptionImage } : prescriptionImage;
            if (!resolvedSource?.uri && typeof resolvedSource !== 'number') return null;

            return (
              <View key="prescription-section" collapsable={false} style={styles.attachmentOuter}>
                <View collapsable={false} style={styles.attachmentBox}>
                  <Text style={[styles.sectionTitle, styles.attachmentHeading]}>Prescription</Text>

                  <ImageThumb source={resolvedSource} onPress={() => setPreviewImage(resolvedSource)} />
                </View>
              </View>
            );
          })()}

          {/* Discount ID Approval Section */}
          {order.discountIdImagePath && (() => {
            const isDiscountRejected = order.discountRemarks?.toLowerCase().includes('rejected');
            const discountSource = order.discountIdImage || { uri: order.discountIdImagePath };
            return (
              <View key="discount-section" collapsable={false} style={styles.attachmentOuter}>
                <View collapsable={false} style={styles.attachmentBox}>
                  <Text style={[styles.sectionTitle, styles.attachmentHeading]}>
                    {order.discountType ? `Discount (${DISCOUNT_TYPE_LABELS[order.discountType] ?? order.discountType})` : 'Discount ID'}
                  </Text>

                  <View style={{ position: 'relative' }}>
                    <ImageThumb source={discountSource} onPress={() => setPreviewImage(discountSource)} />
                    {isDiscountRejected && (
                      <View pointerEvents="none" className="absolute inset-0 z-10 items-center justify-center px-4" style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 12 }}>
                        <Text className="text-[#DC3545] text-base mb-1" style={{ fontFamily: 'Poppins-Bold' }}>ID Rejected</Text>
                        <Text className="text-gray-600 text-[10px] text-center" style={{ fontFamily: 'Poppins-Medium' }}>Customer has been notified to bring physical ID.</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })()}

          {/* Payment Receipt Section */}
          {order.paymentReceiptImagePath && (() => {
            const isReceiptRejected = order.paymentStatus === 'failed';
            const receiptSource = order.paymentReceiptImage || { uri: order.paymentReceiptImagePath };
            return (
              <View key="receipt-section" collapsable={false} style={styles.attachmentOuter}>
                <View collapsable={false} style={styles.attachmentBox}>
                  <Text style={[styles.sectionTitle, styles.attachmentHeading]}>Payment Receipt</Text>

                  <View style={{ position: 'relative' }}>
                    <ImageThumb source={receiptSource} onPress={() => setPreviewImage(receiptSource)} />
                    {isReceiptRejected && (
                      <View pointerEvents="none" className="absolute inset-0 z-10 items-center justify-center px-4" style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 12 }}>
                        <Text className="text-[#DC3545] text-base mb-1" style={{ fontFamily: 'Poppins-Bold' }}>Receipt Rejected</Text>
                        <Text className="text-gray-600 text-[10px] text-center" style={{ fontFamily: 'Poppins-Medium' }}>Customer notified to pay upon pickup.</Text>
                      </View>
                    )}
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

function ImageThumb({ source, onPress }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const uriKey = typeof source === 'string' ? source : source?.uri;

  useEffect(() => {
    setFailed(false);
  }, [uriKey]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={thumbStyles.container}
    >
      {!failed && (
        <Image
          source={source}
          style={thumbStyles.image}
          resizeMode="cover"
          onLoad={() => setLoading(false)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setFailed(true); setLoading(false); }}
        />
      )}
      {loading && !failed && (
        <View style={thumbStyles.center} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.buttonColor} />
        </View>
      )}
      {failed && (
        <View style={thumbStyles.center} pointerEvents="none">
          <Ionicons name="image-outline" size={22} color="#9CA3AF" />
          <Text style={thumbStyles.failText}>Tap to view image</Text>
        </View>
      )}
      <View style={thumbStyles.badge} pointerEvents="none">
        <Ionicons name="scan-outline" size={12} color="#fff" />
        <Text style={thumbStyles.badgeText}>Tap to enlarge</Text>
      </View>
    </TouchableOpacity>
  );
}

const thumbStyles = StyleSheet.create({
  container: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 130,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failText: { fontFamily: 'Poppins-Medium', fontSize: 10, color: '#6B7280', marginTop: 4 },
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, marginLeft: 4, fontFamily: 'Poppins-Medium', includeFontPadding: false },
});

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  attachmentOuter: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  attachmentBox: {
    backgroundColor: '#EBF3F7',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  attachmentHeading: {
    fontSize: 14,
    marginBottom: 12,
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
  markCompletedButton: {
    backgroundColor: colors.buttonColor,
  },
});
