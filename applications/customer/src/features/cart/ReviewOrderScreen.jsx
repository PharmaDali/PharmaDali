import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@src/shared/theme/colorPalette'
import RxIcon from '@assets/icons/rx_icon.svg'
import LogoHeader from '@src/shared/components/LogoHeader'
import RedLocationIcon from '@assets/icons/red_location_icon.svg'
import StepIndicator from '@src/shared/components/StepIndicator'
import RedInfoIcon from '@assets/icons/red_info_icon.svg'
import BlueInfoIcon from '@assets/icons/blue_info_icon.svg'
import ProductImage from '@shared/components/ProductImage'
import TermsAndConditionsModal from '@shared/components/TermsAndConditionsModal'
import { getCheckoutDraft } from '@shared/services/checkoutDraft'
import { formatPharmacyHoursLabel } from '@src/utils/pickupScheduleUtils'

function truncateText(value, maxLength = 48) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function OrderItemRow({ item }) {
  const displayName = truncateText(item.description);

  return (
    <View className="flex-row mt-3">
      <ProductImage
        source={item.img}
        product={item.product}
        categoryName={item?.category?.category_name}
        quantity={item.quantity}
        isPrescribed={item.prescriptionRequired}
        isAvailable={item.isAvailable}
        isOutOfStock={item.isOutOfStock}
        stock={item.stock}
        width={64}
        height={64}
        containerStyle={{ borderRadius: 8 }}
      />
      <View className="flex-1 ml-3">
        <Text className="text-xs" style={styles.fontSemiBold} numberOfLines={2}>
          {displayName}
        </Text>
        {item.prescriptionRequired && (
          <View className="flex-row items-center mt-1">
            <RxIcon width={12} height={12} />
            <Text className="text-[10px] ml-1" style={styles.rxText}>Prescription Required</Text>
          </View>
        )}
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm" style={styles.priceText}>
            PHP {item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          <View className="items-end">
            <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>{item.quantity}x</Text>
            <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>{item.sizeLabel || 'Size'}: {item.size}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const ReviewOrderScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [showTermsModal, setShowTermsModal] = useState(false)
  const {
    items: orderItems,
    selectedPharmacy: draftPharmacy,
    pharmacyLabel,
    pharmacyLocationLabel,
    total: checkoutTotal,
    isPharmacyOpen: draftPharmacyOpen,
    isPharmacyActive: draftPharmacyActive,
    closedPharmacyName,
    pharmacyHoursLabel,
  } = getCheckoutDraft()
  const isPharmacyOpen = draftPharmacyOpen !== false
  const isPharmacyActive = draftPharmacyActive !== false
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const effectiveTotal = checkoutTotal > 0 ? checkoutTotal : total
  const hasPrescription = orderItems.some((item) => item.prescriptionRequired)
  const canProceed = orderItems.length > 0 && isPharmacyActive

  const effectiveHoursLabel = useMemo(() => {
    if (pharmacyHoursLabel && !pharmacyHoursLabel.toLowerCase().includes('unavail') && pharmacyHoursLabel.toLowerCase() !== 'closed') {
      return pharmacyHoursLabel;
    }
    const target =
      draftPharmacy ||
      orderItems.find((i) => i?.pharmacy?.opening_hour || i?.pharmacy?.openingHour)?.pharmacy ||
      orderItems[0]?.pharmacy;
    return formatPharmacyHoursLabel(target) || '';
  }, [pharmacyHoursLabel, draftPharmacy, orderItems]);

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <LogoHeader />

      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={0} hasPrescription={hasPrescription} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center mx-4 mt-4 mb-3">
          <RedLocationIcon width={24} height={24} />
          <View className="ml-2.5 flex-1 justify-center">
            <Text className="text-xs" style={styles.fontSemiBold}>Pickup at {pharmacyLabel || 'Selected pharmacy'}</Text>
            {pharmacyLocationLabel ? (
              <Text className="text-[10px] text-gray-500 mt-0.5" style={styles.fontMedium}>
                {pharmacyLocationLabel}
              </Text>
            ) : null}
          </View>
        </View>

        {!isPharmacyActive && (
          <View className="mx-4 mb-3 bg-[#FFEAEA] border border-[#FFCCCC] rounded-xl p-3 flex-row items-center">
            <RedInfoIcon width={18} height={18} />
            <View className="flex-1 ml-2.5">
              <Text className="text-xs text-[#B42318]" style={styles.fontSemiBold}>
                Pharmacy Temporarily Inactive
              </Text>
              <Text className="text-[11px] text-[#7A271A] mt-0.5" style={styles.fontMedium}>
                {closedPharmacyName || pharmacyLabel || 'This pharmacy'} is temporarily inactive and not accepting orders.
              </Text>
            </View>
          </View>
        )}

        {isPharmacyActive && !isPharmacyOpen && (
          <View className="mx-4 mb-3 bg-[#EFF8FF] border border-[#B2DDFF] rounded-xl p-3 flex-row items-start">
            <BlueInfoIcon width={18} height={18} style={{ marginTop: 2 }} />
            <View className="flex-1 ml-2.5">
              <Text className="text-xs" style={[styles.fontSemiBold, { color: '#444444' }]}>
                Store is currently closed
              </Text>
              <Text className="text-[11px] mt-0.5 leading-4" style={[styles.fontMedium, { color: '#444444' }]}>
                Pickup will be scheduled for tomorrow during store hours{effectiveHoursLabel ? ` (${effectiveHoursLabel})` : ''}.
              </Text>
            </View>
          </View>
        )}

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 p-4">
          <Text className="text-sm" style={styles.fontBold}>Order Items</Text>

          {orderItems.length === 0 && (
            <Text className="text-xs text-gray-500 mt-3" style={styles.fontMedium}>
              No selected items found. Please go back to cart and select products.
            </Text>
          )}

          {orderItems.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}

          <View className="border-b border-gray-200 my-3" />
          <View className="flex-row justify-between items-center">
            <Text className="text-sm" style={styles.fontBold}>Order Summary</Text>
            <Text className="text-sm" style={styles.priceText}>
              PHP {effectiveTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        {hasPrescription && (
          <View className="flex-row items-center mx-4 mt-3 mb-4">
            <RedInfoIcon width={16} height={16} />
            <Text className="text-[10px] text-gray-500 ml-2" style={styles.fontMedium}>
              Prescription required for some items.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* T&C Agreement Notice */}
      <View className="items-center px-6 pt-2 pb-1 bg-white">
        <Text className="text-[11px] text-gray-500 text-center" style={styles.fontMedium}>
          By proceeding, you agree to PharmaDali’s{' '}
          <Text
            className="text-[#48AAD9]"
            style={styles.fontSemiBold}
            onPress={() => setShowTermsModal(true)}
          >
            Terms & Conditions
          </Text>
          .
        </Text>
      </View>

      <View className="flex-row justify-center gap-4 px-6 pb-4 pt-2 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 border border-[#48AAD9] rounded-xl py-2.5 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-sm" style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 rounded-xl py-2.5 items-center ${!canProceed ? 'bg-gray-300' : 'bg-[#48AAD9]'}`}
          onPress={() => {
            if (!canProceed) return;
            router.push(
              hasPrescription
                ? '/tabs/cart/UploadPrescription'
                : '/tabs/cart/PickupDetails',
            );
          }}
          disabled={!canProceed}
        >
          <Text className="text-sm text-white" style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>

      <TermsAndConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </View>
  )
}

export default ReviewOrderScreen

const styles = StyleSheet.create({
  fontBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
  },
  nextText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  rxText: {
    fontFamily: 'Poppins-Medium',
    color: '#DC3545',
  },
  cancelText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  }
})

