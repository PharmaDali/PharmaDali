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
import { submitCheckoutOrder } from '@shared/services/checkoutSubmissionService'
import { useSelectionPhase } from '@shared/SelectionPhaseContext'
import {
  buildEffectivePickupBounds,
  buildScheduledPickupDateTime,
  validateScheduledPickupTime,
} from '@shared/validation/pickupValidation'
import {
  formatMinutesToAmPm,
  parseBranchOperatingMinutes,
} from '@src/utils/pickupScheduleUtils'

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

  // Always use today's date
  const selectedDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }, [])

  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState(null)
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const operatingMinutes = useMemo(() => parseBranchOperatingMinutes(selectedBranch), [selectedBranch])
  const openingMinutes = operatingMinutes.openingMinutes
  const closingMinutes = operatingMinutes.closingMinutes
  const hasValidOperatingWindow = Number.isFinite(openingMinutes) && Number.isFinite(closingMinutes) && openingMinutes < closingMinutes

  // Check whether the pharmacy is open RIGHT NOW (not just whether a schedule is set).
  const isPharmacyClosed = useMemo(() => {
    if (!hasValidOperatingWindow) return false // let other validations handle this
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    return currentMinutes < openingMinutes || currentMinutes >= closingMinutes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidOperatingWindow, openingMinutes, closingMinutes])

  const { minimumDateTime, closingDateTime, hasWindowToday } = useMemo(
    () => buildEffectivePickupBounds(selectedDate, openingMinutes, closingMinutes),
    [selectedDate, openingMinutes, closingMinutes],
  )

  const selectedTimeLabel = selectedTime
    ? selectedTime.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
    : 'Select pickup time'

  const confirmPickupValidationError = useMemo(() => {
    if (items.length === 0) {
      return 'No selected items found for checkout.'
    }

    if (hasPrescription && !prescriptionImage?.uri) {
      return 'Please complete prescription upload first.'
    }

    const scheduledPickupAt = selectedTime
      ? buildScheduledPickupDateTime(selectedDate, selectedTime)
      : null

    return validateScheduledPickupTime({
      scheduledDateTime: scheduledPickupAt,
      hasValidOperatingWindow,
      closingMinutes,
      minimumDateTime,
      closingDateTime,
    })
  }, [
    items,
    hasPrescription,
    prescriptionImage,
    selectedTime,
    selectedDate,
    hasValidOperatingWindow,
    closingMinutes,
    minimumDateTime,
    closingDateTime,
  ])

  const isConfirmPickupDisabled = submitting || isPharmacyClosed || Boolean(confirmPickupValidationError) || Boolean(submitError)

  useEffect(() => {
    if (!hasValidOperatingWindow || !hasWindowToday) {
      setSelectedTime(null)
      return
    }

    if (selectedTime && selectedTime >= minimumDateTime && selectedTime <= closingDateTime) {
      return
    }

    setSelectedTime(new Date(minimumDateTime))
  }, [hasValidOperatingWindow, hasWindowToday, minimumDateTime, closingDateTime, selectedTime])

  const handleTimePickerChange = (event, pickedValue) => {
    setShowTimePicker(false)

    if (event?.type === 'dismissed' || !pickedValue || !hasValidOperatingWindow) {
      return
    }

    const candidate = new Date(selectedDate)
    candidate.setHours(pickedValue.getHours(), pickedValue.getMinutes(), 0, 0)

    const timeError = validateScheduledPickupTime({
      scheduledDateTime: candidate,
      hasValidOperatingWindow,
      closingMinutes,
      minimumDateTime,
      closingDateTime,
    })

    if (timeError) {
      setSubmitError(timeError)
      return
    }

    setSubmitError('')
    setSelectedTime(candidate)
  }

  const handleConfirmPickup = async () => {
    if (confirmPickupValidationError) {
      setSubmitError(confirmPickupValidationError)
      return
    }

    const scheduledPickupAt = buildScheduledPickupDateTime(selectedDate, selectedTime)

    setSubmitting(true)
    setSubmitError('')

    try {
      const normalizedCustomerNote = customerNote.trim()
      const selectedBranchLabel = selectedBranch?.name || ''
      const { orderId } = await submitCheckoutOrder({
        items,
        hasPrescription,
        prescriptionImage,
        selectedBranchLabel,
        scheduledPickupAt,
        customerNote: normalizedCustomerNote,
      })

      setCheckoutDraft({
        ...getCheckoutDraft(),
        orderId,
      })

      router.replace('/tabs/cart/OrderSubmitted')
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
          <View className="flex-row items-center">
            <RedLocationIcon width={18} height={18} />
            <Text className="text-xs ml-2" style={styles.fontSemiBold}>
              Pickup at {selectedBranch?.name || 'Selected branch'}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 p-4">
          <Text className="text-sm mb-2" style={styles.fontBold}>Pickup Time</Text>
          <TouchableOpacity
            className={`rounded-xl border px-3 py-3 ${hasValidOperatingWindow && hasWindowToday ? 'border-[#48AAD9] bg-[#F8FCFF]' : 'border-gray-300 bg-gray-100'}`}
            disabled={!hasValidOperatingWindow || !hasWindowToday}
            onPress={() => {
              setSubmitError('')
              setShowTimePicker(true)
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs" style={styles.fontSemiBold}>{selectedTimeLabel}</Text>
              <Text className="text-[10px]" style={styles.primarySemiBold}>Choose</Text>
            </View>
            <Text className="text-[10px] text-gray-500 mt-1" style={styles.fontMedium}>
              {hasValidOperatingWindow && hasWindowToday
                ? `Available between ${minimumDateTime.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })} and ${formatMinutesToAmPm(closingMinutes)}`
                : hasValidOperatingWindow
                  ? 'No pickup slots available today.'
                  : 'Operating hours unavailable for this branch'}
            </Text>
            <Text className="text-[10px] text-gray-400 mt-0.5" style={styles.fontMedium}>
              {selectedTime ? 'Tap to change time' : 'Tap to pick a time'}
            </Text>
          </TouchableOpacity>

          {!!selectedTime && (
            <View className="mt-2 rounded-lg bg-[#EEF7FD] border border-[#D4EAF8] px-3 py-2">
              <Text className="text-[10px]" style={styles.fontMedium}>
                Pickup schedule: <Text style={styles.fontSemiBold}>Today, {selectedTimeLabel}</Text>
              </Text>
            </View>
          )}

          {!!submitError && (
            <View className="mt-2 rounded-lg bg-[#FFF1F1] border border-[#FFD7D7] px-3 py-2">
              <Text className="text-[10px] text-[#B42318]" style={styles.fontMedium}>{submitError}</Text>
            </View>
          )}

          {showTimePicker && hasValidOperatingWindow && hasWindowToday && (
            <DateTimePicker
              mode="time"
              value={selectedTime || minimumDateTime}
              onChange={handleTimePickerChange}
              minimumDate={minimumDateTime}
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
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs" style={styles.fontBold}>Total Items: {totalItems}</Text>
            <Text className="text-xs">
              <Text style={styles.fontBold}>Total: </Text>
              <Text style={styles.priceText}>PHP {effectiveTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
            </Text>
          </View>

        </View>

        {isPharmacyClosed && (
          <View className="flex-row items-start bg-[#FFF7ED] rounded-xl mx-4 mt-3 mb-1 p-3 border border-[#FCD34D]">
            <RedInfoIcon width={14} height={14} />
            <View className="flex-1 ml-2">
              <Text className="text-xs" style={styles.closedWarningTitle}>Pharmacy is currently closed</Text>
              <Text className="text-[10px] mt-0.5" style={styles.closedWarningBody}>
                Orders can only be placed during operating hours ({formatMinutesToAmPm(openingMinutes)} – {formatMinutesToAmPm(closingMinutes)}). Please come back during open hours.
              </Text>
            </View>
          </View>
        )}

        <View className="mx-4 mt-3 mb-4 rounded-xl bg-[#EEF7FD] border border-[#C8E3F5] px-4 py-3">
          <Text className="text-[10px] mb-1" style={styles.noteHeading}>Things to know</Text>
          <View className="flex-row items-start mt-1">
            <Text style={styles.noteBullet}>•</Text>
            <Text className="text-[10px] ml-1.5 flex-1" style={styles.noteText}>Payment is collected at the pharmacy upon pickup — cash or GCash accepted.</Text>
          </View>
          <View className="flex-row items-start mt-1">
            <Text style={styles.noteBullet}>•</Text>
            <Text className="text-[10px] ml-1.5 flex-1" style={styles.noteText}>Final amount may change after pharmacist review.</Text>
          </View>
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

        <TouchableOpacity
          className={`flex-1 rounded-xl py-2.5 items-center ${isConfirmPickupDisabled ? 'bg-gray-300' : 'bg-[#48AAD9]'}`}
          onPress={handleConfirmPickup}
          disabled={isConfirmPickupDisabled}
        >
          <Text className={`text-sm ${isConfirmPickupDisabled ? 'text-gray-500' : 'text-white'}`} style={styles.confirmPickupText}>
            {submitting ? 'Submitting...' : 'Confirm Pickup'}
          </Text>
        </TouchableOpacity>
      </View>
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
  closedWarningTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#92400E',
  },
  closedWarningBody: {
    fontFamily: 'Poppins-Medium',
    color: '#78350F',
  },
  noteHeading: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: colors.buttonColor,
  },
  noteBullet: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: '#5A8FAA',
    lineHeight: 16,
  },
  noteText: {
    fontFamily: 'Poppins-Medium',
    color: '#4A7A94',
    lineHeight: 16,
  },
})
