import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { colors } from '@src/shared/theme/colorPalette'
import RedLocationIcon from '@assets/icons/red_location_icon.svg'
import LogoHeader from '@src/shared/components/LogoHeader'
import RedInfoIcon from '@assets/icons/red_info_icon.svg'
import StepIndicator from '@src/shared/components/StepIndicator'
import { getCheckoutDraft, setCheckoutDraft } from '@shared/services/checkoutDraft'
import { placeCustomerOrder } from '@shared/services/orderService'
import { uploadOrderItemPrescription } from '@shared/services/prescriptionService'
import { useSelectionPhase } from '@shared/SelectionPhaseContext'
import {
  buildDateAtMinutes,
  buildDynamicPickupDates,
  formatMinutesToAmPm,
  parseBranchOperatingMinutes,
} from '@src/utils/pickupScheduleUtils'

function RadioButton({ selected, onPress, label }) {
  return (
    <TouchableOpacity className="flex-row items-center py-1.5" onPress={onPress}>
      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
        selected ? 'border-[#48AAD9]' : 'border-gray-300'
      }`}>
        {selected && <View className="w-2.5 h-2.5 rounded-full bg-[#48AAD9]" />}
      </View>
      <Text className="text-xs ml-2" style={styles.fontMedium}>{label}</Text>
    </TouchableOpacity>
  )
}

const PickupDetailsScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { selectedBranch } = useSelectionPhase()
  const { items, total, prescriptionImage } = getCheckoutDraft()
  const hasPrescription = items.some((item) => item.prescriptionRequired)
  const totalItems = items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)
  const effectiveTotal = total > 0
    ? total
    : items.reduce((sum, item) => sum + (Number(item?.price || 0) * (Number(item?.quantity) || 0)), 0)
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const pickupDates = useMemo(() => buildDynamicPickupDates(7), [])

  const selectedDate = pickupDates[selectedDateIndex]?.date || pickupDates[0]?.date || new Date()

  const operatingMinutes = useMemo(
    () => parseBranchOperatingMinutes(selectedBranch),
    [selectedBranch],
  )

  const openingMinutes = operatingMinutes.openingMinutes
  const closingMinutes = operatingMinutes.closingMinutes
  const hasValidOperatingWindow = Number.isFinite(openingMinutes) && Number.isFinite(closingMinutes) && openingMinutes < closingMinutes

  const openingDateTime = useMemo(() => buildDateAtMinutes(selectedDate, openingMinutes), [selectedDate, openingMinutes])
  const closingDateTime = useMemo(() => buildDateAtMinutes(selectedDate, closingMinutes), [selectedDate, closingMinutes])

  useEffect(() => {
    if (!hasValidOperatingWindow) {
      return
    }

    const defaultTime = buildDateAtMinutes(selectedDate, openingMinutes)
    setSelectedTime(defaultTime)
  }, [selectedDate, openingMinutes, hasValidOperatingWindow])

  const handleTimePickerChange = (_event, pickedValue) => {
    setShowTimePicker(false)

    if (!pickedValue || !hasValidOperatingWindow) {
      return
    }

    const candidate = new Date(pickedValue)
    const candidateMinutes = (candidate.getHours() * 60) + candidate.getMinutes()

    if (candidateMinutes < openingMinutes || candidateMinutes > closingMinutes) {
      setSubmitError(`Pickup time must be between ${formatMinutesToAmPm(openingMinutes)} and ${formatMinutesToAmPm(closingMinutes)}.`)
      return
    }

    setSubmitError('')
    setSelectedTime(candidate)
  }

  const handleConfirmPickup = async () => {
    if (items.length === 0) {
      setSubmitError('No selected items found for checkout.')
      return
    }

    if (hasPrescription && !prescriptionImage?.uri) {
      setSubmitError('Please complete prescription upload first.')
      return
    }

    if (!hasValidOperatingWindow) {
      setSubmitError('Pharmacy operating hours are unavailable. Please reselect your branch.')
      return
    }

    if (!selectedTime) {
      setSubmitError('Please select a pickup time within pharmacy operating hours.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const selectedDateLabel = pickupDates[selectedDateIndex]?.label || pickupDates[0]?.label

      const scheduledPickupAt = new Date(selectedDate)
      scheduledPickupAt.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0)

      const normalizedCustomerNote = customerNote.trim()
      const selectedBranchLabel = selectedBranch?.name || selectedDateLabel
      const selectedCartItemIds = items
        .map((item) => Number(item?.id))
        .filter((id) => Number.isFinite(id) && id > 0)

      const orderPayload = await placeCustomerOrder({
        paymentMethod: 'cash',
        scheduledPickupAt: scheduledPickupAt.toISOString(),
        pickedUpAt: selectedBranchLabel,
        note: normalizedCustomerNote || null,
        cartItemIds: selectedCartItemIds,
      })

      const order = orderPayload?.data || {}
      const orderItems = Array.isArray(order?.items) ? order.items : []

      if (hasPrescription) {
        const prescriptionItems = items.filter((item) => item.prescriptionRequired)

        for (const item of prescriptionItems) {
          const matchedOrderItem = orderItems.find(
            (orderItem) => Number(orderItem?.branch_product_id) === Number(item?.branchProductId),
          )

          const orderItemId = Number(matchedOrderItem?.id || 0)

          if (!orderItemId) {
            throw new Error('Unable to match prescription item to the created order.')
          }

          await uploadOrderItemPrescription(orderItemId, prescriptionImage)
        }
      }

      setCheckoutDraft({
        ...getCheckoutDraft(),
        orderId: Number(order?.id ?? 0) || null,
      })

      router.replace('/customer/tabs/cart/OrderSubmitted')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to confirm pickup.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <LogoHeader />

      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={hasPrescription ? 2 : 1} hasPrescription={hasPrescription} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <RedLocationIcon width={18} height={18} />
              <Text className="text-xs ml-2" style={styles.fontSemiBold}>
                Pickup at {selectedBranch?.name || 'Selected branch'}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 p-4">
          <Text className="text-sm mb-2" style={styles.fontBold}>Pickup Date</Text>
          {pickupDates.map((pickupDate, index) => (
            <RadioButton
              key={pickupDate.key}
              selected={selectedDateIndex === index}
              onPress={() => setSelectedDateIndex(index)}
              label={pickupDate.label}
            />
          ))}

          <Text className="text-sm mt-4 mb-2" style={styles.fontBold}>Pickup Time</Text>
          <TouchableOpacity
            className={`rounded-xl border px-3 py-3 ${hasValidOperatingWindow ? 'border-[#48AAD9]' : 'border-gray-300 bg-gray-100'}`}
            disabled={!hasValidOperatingWindow}
            onPress={() => {
              setSubmitError('')
              setShowTimePicker(true)
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs" style={styles.fontSemiBold}>
                {selectedTime
                  ? selectedTime.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
                  : 'Select pickup time'}
              </Text>
              <Text className="text-[10px]" style={styles.primarySemiBold}>Choose</Text>
            </View>
            <Text className="text-[10px] text-gray-500 mt-1" style={styles.fontMedium}>
              {hasValidOperatingWindow
                ? `Available between ${formatMinutesToAmPm(openingMinutes)} and ${formatMinutesToAmPm(closingMinutes)}`
                : 'Operating hours unavailable for this branch'}
            </Text>
            <Text className="text-[10px] text-gray-400 mt-0.5" style={styles.fontMedium}>
              {selectedTime
                ? 'Tap to change time'
                : 'Tap to pick a time'}
            </Text>
          </TouchableOpacity>

          {showTimePicker && hasValidOperatingWindow && (
            <DateTimePicker
              mode="time"
              value={selectedTime || openingDateTime}
              onChange={handleTimePickerChange}
              minimumDate={openingDateTime}
              maximumDate={closingDateTime}
              minuteInterval={15}
            />
          )}

          <Text className="text-sm mt-4 mb-2" style={styles.fontBold}>Customer Notes (Optional)</Text>
          <TextInput
            value={customerNote}
            onChangeText={setCustomerNote}
            placeholder="Add note for pharmacist (e.g., call me before substitution)"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={250}
            className="rounded-xl border border-gray-300 px-3 py-3"
            style={styles.noteInput}
            textAlignVertical="top"
          />
          <Text className="text-[10px] text-gray-400 mt-1 self-end" style={styles.fontMedium}>
            {customerNote.length}/250
          </Text>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 p-4">
          <Text className="text-sm mb-2" style={styles.fontBold}>Payment Method</Text>
          <View className="flex-row items-center">
            <View className="w-5 h-5 rounded-full border-2 border-[#48AAD9] items-center justify-center">
              <View className="w-2.5 h-2.5 rounded-full bg-[#48AAD9]" />
            </View>
            <Text className="text-xs ml-2" style={styles.fontMedium}>Pay at Pharmacy (Cash/GCash)</Text>
          </View>

          <View className="border-b border-gray-200 my-3" />

          <View className="flex-row justify-between items-center">
            <Text className="text-xs" style={styles.fontBold}>Total Items: {totalItems}</Text>
            <Text className="text-xs">
              <Text style={styles.fontBold}>Estimated Total: </Text>
              <Text style={styles.priceText}>₱{effectiveTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-[#E8F4FD] rounded-xl mx-4 mt-3 mb-4 p-3 border border-[#B8DEF0]">
          <RedInfoIcon width={14} height={14} />
          <Text className="text-[10px] text-gray-500 ml-2" style={styles.fontMedium}>
            Final amount may change after pharmacist review.
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row justify-center gap-4 px-6 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 border border-[#48AAD9] rounded-xl py-2.5 items-center"
          disabled={submitting}
          onPress={() => router.back()}
        >
          <Text className="text-sm" style={styles.primarySemiBold}>Go back</Text>
        </TouchableOpacity>
        <TouchableOpacity className={`flex-1 rounded-xl py-2.5 items-center ${submitting ? 'bg-gray-300' : 'bg-[#48AAD9]'}`}
          onPress={handleConfirmPickup}
          disabled={submitting}
        >
          <Text className={`text-sm ${submitting ? 'text-gray-500' : 'text-white'}`} style={styles.confirmPickupText}>
            {submitting ? 'Submitting...' : 'Confirm Pickup'}
          </Text>
        </TouchableOpacity>
      </View>
      {!!submitError && (
        <View className="px-6 pb-3 bg-white">
          <Text className="text-xs text-[#B42318]" style={styles.fontMedium}>{submitError}</Text>
        </View>
      )}
    </View>
  )
}

export default PickupDetailsScreen

const styles = StyleSheet.create({
  fontBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  confirmPickupText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  primarySemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  noteInput: {
    fontFamily: 'Poppins-Medium',
    minHeight: 90,
    color: colors.textColor,
  },
})
