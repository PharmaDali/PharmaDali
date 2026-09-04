import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Modal } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '@src/shared/theme/colorPalette'
import RedLocationIcon from '@assets/icons/red_location_icon.svg'
import LogoHeader from '@src/shared/components/LogoHeader'
import RedInfoIcon from '@assets/icons/red_info_icon.svg'
import GcashPaymentSection from '@shared/components/GcashPaymentSection'
import DiscountIcon from '@assets/icons/discount_icon.svg'
import BlueInfoIcon from '@assets/icons/blue_info_icon.svg'
import PaymentMethodIcon from '@assets/icons/payment_method_icon.svg'
import GcashIcon from '@assets/icons/gcash_icon.svg'
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg'
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg'
import StepIndicator from '@src/shared/components/StepIndicator'
import { getCheckoutDraft, setCheckoutDraft } from '@shared/services/checkoutDraft'
import { useOrderSubmission } from '@shared/context/OrderSubmissionContext'
import { useSelectionPhase } from '@shared/context/SelectionPhaseContext'
import {
  buildEffectivePickupBounds,
  buildScheduledPickupDateTime,
  validateScheduledPickupTime,
} from '@shared/validation/pickupValidation'
import {
  formatMinutesToAmPm,
  parsePharmacyOperatingMinutes,
} from '@src/utils/pickupScheduleUtils'

const PickupDetailsScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { selectedPharmacy } = useSelectionPhase()
  const { submitOptimisticOrder } = useOrderSubmission()
  const { items, total, prescriptionImage, discountIdImage: draftDiscountId, gcashReceiptImage: draftGcashReceipt, pharmacyLabel, pharmacyLocationLabel } = getCheckoutDraft()

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
  const draft = getCheckoutDraft()
  const [discountType, setDiscountType] = useState(draft.discountType || null)
  const [discountIdImage, setDiscountIdImage] = useState(draftDiscountId || null)
  const [discountIdNumber, setDiscountIdNumber] = useState(draft.discountIdNumber || '')
  const [isDiscountConfirmed, setIsDiscountConfirmed] = useState(!!draft.discountIdNumber && !!draft.discountType && !!draftDiscountId)
  const [showDiscountDropdown, setShowDiscountDropdown] = useState(false)
  const [gcashReceiptImage, setGcashReceiptImage] = useState(draftGcashReceipt || null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [expandedImageUri, setExpandedImageUri] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const operatingMinutes = useMemo(() => parsePharmacyOperatingMinutes(selectedPharmacy), [selectedPharmacy])
  const openingMinutes = operatingMinutes.openingMinutes
  const closingMinutes = operatingMinutes.closingMinutes
  const hasValidOperatingWindow = Number.isFinite(openingMinutes) && Number.isFinite(closingMinutes) && openingMinutes < closingMinutes

  const hasDiscountableItems = useMemo(() => {
    if (!items || items.length === 0) return false
    return items.some((item) => item.isDiscountable !== false)
  }, [items])

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

  const formatTime12Hour = (date) => {
    if (!date || !(date instanceof Date)) return ''
    return date.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const selectedTimeLabel = selectedTime
    ? formatTime12Hour(selectedTime)
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

    if (selectedTime && (selectedTime < minimumDateTime || selectedTime > closingDateTime)) {
      setSelectedTime(null)
    }
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

  const handlePickDiscountIdFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        setSubmitError('Permission to access media library was denied.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      })

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0]
        const selected = {
          uri: asset.uri,
          fileName: asset.fileName || 'discount_id.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
        }
        setDiscountIdImage(selected)
        setCheckoutDraft({
          ...getCheckoutDraft(),
          discountIdImage: selected,
        })
      }
    } catch (err) {
      setSubmitError('Failed to pick image from gallery.')
    }
  }

  const handleTakeDiscountIdPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        setSubmitError('Permission to access camera was denied.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      })

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0]
        const selected = {
          uri: asset.uri,
          fileName: asset.fileName || 'discount_id.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
        }
        setDiscountIdImage(selected)
        setCheckoutDraft({
          ...getCheckoutDraft(),
          discountIdImage: selected,
        })
      }
    } catch (err) {
      setSubmitError('Failed to take photo.')
    }
  }

  const handleRemoveDiscountId = () => {
    setDiscountIdImage(null)
    setCheckoutDraft({
      ...getCheckoutDraft(),
      discountIdImage: null,
    })
  }

  const handlePickGcashReceiptFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        setSubmitError('Permission to access gallery is required.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selected = result.assets[0]
        setGcashReceiptImage(selected)
        setCheckoutDraft({
          ...getCheckoutDraft(),
          gcashReceiptImage: selected,
        })
      }
    } catch (err) {
      setSubmitError('Failed to pick GCash receipt image.')
    }
  }

  const handleTakeGcashReceiptPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
      if (!permissionResult.granted) {
        setSubmitError('Permission to access camera is required.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const captured = result.assets[0]
        setGcashReceiptImage(captured)
        setCheckoutDraft({
          ...getCheckoutDraft(),
          gcashReceiptImage: captured,
        })
      }
    } catch (err) {
      setSubmitError('Failed to take photo.')
    }
  }

  const handleRemoveGcashReceipt = () => {
    setGcashReceiptImage(null)
    setCheckoutDraft({
      ...getCheckoutDraft(),
      gcashReceiptImage: null,
    })
  }

  const handleConfirmPickup = () => {
    if (confirmPickupValidationError) {
      setSubmitError(confirmPickupValidationError)
      return
    }

    if (discountIdImage && (!discountType || !discountIdNumber)) {
      setSubmitError('Please complete your discount ID type and number.')
      return
    }

    if (discountType && !discountIdImage) {
      setSubmitError('Please upload your discount ID photo.')
      return
    }

    if (!hasPrescription && !discountIdImage && paymentMethod === 'gcash' && !gcashReceiptImage) {
      setSubmitError('Please upload your GCash payment receipt.')
      return
    }

    const scheduledPickupAt = buildScheduledPickupDateTime(selectedDate, selectedTime)
    setSubmitError('')
    setShowConfirmModal(true)
  }

  const actuallySubmitOrder = () => {
    setShowConfirmModal(false)
    const normalizedCustomerNote = customerNote.trim()
    const selectedPharmacyLabel = selectedPharmacy?.name || pharmacyLabel || ''
    
    const scheduledPickupAt = buildScheduledPickupDateTime(selectedDate, selectedTime)
    const payload = {
      items,
      hasPrescription,
      prescriptionImage,
      discountIdImage,
      discountType,
      discountIdNumber,
      gcashReceiptImage,
      selectedPharmacyLabel,
      scheduledPickupAt,
      customerNote: normalizedCustomerNote,
      paymentMethod,
    }

    // Build summary for OrderSubmittedScreen
    const now = new Date()
    const orderDateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    let pickupDateFormatted = ''
    if (scheduledPickupAt) {
      const pDate = `${scheduledPickupAt.getFullYear()}-${String(scheduledPickupAt.getMonth() + 1).padStart(2, '0')}-${String(scheduledPickupAt.getDate()).padStart(2, '0')}`
      const pTime = scheduledPickupAt.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      pickupDateFormatted = `${pDate} ${pTime}`
    }

    const summary = {
      orderDate: orderDateFormatted,
      pickupDate: pickupDateFormatted,
      paymentMethod: paymentMethod === 'gcash' ? 'Pay Upfront (GCash Payment)' : 'Pay In-Store (Cash)',
      items: items.map(i => ({
        name: i.description || i.product?.name || 'Product',
        qty: i.quantity,
        rx: i.prescriptionRequired,
        price: i.price
      })),
      total: effectiveTotal
    }

    // Submit optimistically in the background
    submitOptimisticOrder(payload)

    // Instantly navigate with summary params
    router.replace({
      pathname: '/tabs/cart/OrderSubmitted',
      params: { summary: JSON.stringify(summary) }
    })
  }

  const displayLocation = pharmacyLocationLabel || selectedPharmacy?.address || selectedPharmacy?.location || ''

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <LogoHeader />

      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={hasPrescription ? 2 : 1} hasPrescription={hasPrescription} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
          <View className="flex-row items-start">
            <RedLocationIcon width={18} height={18} />
            <View className="ml-2 flex-1">
              <Text className="text-xs" style={styles.fontSemiBold}>
                Pickup at {selectedPharmacy?.name || pharmacyLabel || 'Selected pharmacy'}
              </Text>
              {displayLocation ? (
                <Text className="text-[10px] text-gray-500 mt-0.5" style={styles.fontMedium}>
                  {displayLocation}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 p-4">
          <Text className="text-sm mb-2" style={styles.fontSemiBold}>Pickup Time</Text>
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
                ? `Available between ${formatTime12Hour(minimumDateTime)} and ${formatMinutesToAmPm(closingMinutes)}`
                : hasValidOperatingWindow
                  ? 'No pickup slots available today.'
                  : 'Operating hours unavailable for this pharmacy'}
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
              is24Hour={false}
              value={selectedTime || minimumDateTime}
              onChange={handleTimePickerChange}
              minimumDate={minimumDateTime}
              maximumDate={closingDateTime}
              minuteInterval={15}
            />
          )}

          <Text className="text-sm mt-4 mb-2" style={styles.fontSemiBold}>Customer Notes (Optional)</Text>
          <TextInput
            value={customerNote}
            onChangeText={setCustomerNote}
            placeholder="Add note for pharmacist (e.g., call me before substitution)"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={250}
            className="rounded-xl border border-gray-300 px-3 py-2 text-xs"
            style={styles.noteInput}
            textAlignVertical="top"
          />
          <Text className="text-[10px] text-gray-400 mt-1 self-end" style={styles.fontMedium}>
            {customerNote.length}/250
          </Text>
        </View>

        {/* Senior/PWD Discount Card */}
        {hasDiscountableItems && (
          <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 overflow-hidden">
            <View className="p-4">
              <Text className="text-sm" style={styles.fontSemiBold}>
                Senior/PWD Discount (Optional)
              </Text>
              <Text className="text-xs text-gray-600 mt-1 mb-4" style={styles.fontMedium}>
                If you are availing a Senior or PWD discount, please upload a valid ID.
              </Text>

              <View className="flex-row items-center mb-4 ml-2">
                <DiscountIcon width={24} height={24} color="#48AAD9" />
                <View className="ml-3">
                   <Text className="text-[11px] text-gray-600" style={styles.fontMedium}>Accepted: Senior Citizen ID, PWD ID</Text>
                   <Text className="text-[11px] text-gray-500" style={styles.fontMedium}>File Format: JPG PNG (Max. 5MB)</Text>
                </View>
              </View>

              {(!isDiscountConfirmed) && (
                <View className="flex-row gap-2.5 mb-4">
                  <TouchableOpacity
                    className="flex-1 border border-[#48AAD9] rounded-xl py-3 items-center justify-center bg-white"
                    onPress={handlePickDiscountIdFromGallery}
                  >
                    <Text className="text-xs" style={styles.primarySemiBold}>Upload from Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#48AAD9] rounded-xl py-3 items-center justify-center"
                    onPress={handleTakeDiscountIdPhoto}
                  >
                    <Text className="text-xs text-white" style={styles.confirmPickupText}>Take a Photo</Text>
                  </TouchableOpacity>
                </View>
              )}

              {discountIdImage && !isDiscountConfirmed && (
                <>
                  <View className="border border-dashed border-[#48AAD9] rounded-xl p-4 bg-[#F8FAFC]">
                    <Text className="text-xs text-gray-500 mb-1.5" style={styles.fontMedium}>ID Type</Text>
                    <TouchableOpacity
                      className="border rounded-xl px-4 py-3 flex-row items-center justify-between bg-[#FAFAFA] mb-4"
                      style={{ borderColor: discountType ? '#48AAD9' : '#D1D5DB' }}
                      onPress={() => setShowDiscountDropdown(!showDiscountDropdown)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-xs" style={[styles.fontMedium, { color: discountType ? colors.textColor : '#9CA3AF' }]}>
                        {discountType
                          ? ({ senior_citizen: 'Senior Citizen', pwd: 'PWD (Person with Disability)' }[discountType] ?? discountType)
                          : 'Select ID Type'}
                      </Text>
                      {showDiscountDropdown
                        ? <ArrowUpIcon width={12} height={12} color="#48AAD9" />
                        : <ArrowDownIcon width={12} height={12} color="#9CA3AF" />}
                    </TouchableOpacity>

                    {showDiscountDropdown && (
                      <View className="border border-[#48AAD9] rounded-xl -mt-3 mb-4 overflow-hidden bg-white" style={{ elevation: 3 }}>
                        {[
                          { key: 'senior_citizen', label: 'Senior Citizen' },
                          { key: 'pwd', label: 'PWD (Person with Disability)' },
                        ].map((option, idx, arr) => (
                          <TouchableOpacity
                            key={option.key}
                            className={`px-4 py-3 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                            style={{ backgroundColor: discountType === option.key ? '#EEF7FD' : '#FFFFFF' }}
                            onPress={() => {
                              setDiscountType(option.key)
                              setShowDiscountDropdown(false)
                            }}
                          >
                            <Text className="text-xs" style={[styles.fontMedium, { color: discountType === option.key ? '#48AAD9' : colors.textColor }]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    <Text className="text-xs text-gray-500 mb-1.5" style={styles.fontMedium}>ID Number</Text>
                    <TextInput
                      value={discountIdNumber}
                      onChangeText={setDiscountIdNumber}
                      className="border rounded-xl px-4 py-3 bg-[#FAFAFA] text-xs mb-4"
                      style={{ borderColor: discountIdNumber ? '#48AAD9' : '#D1D5DB', fontFamily: 'Poppins-Medium', color: colors.textColor }}
                    />

                    <View className="relative">
                      <TouchableOpacity
                        onPress={() => setExpandedImageUri(discountIdImage.uri)}
                        activeOpacity={0.9}
                      >
                        <Image
                          source={{ uri: discountIdImage.uri }}
                          className="w-full h-32 rounded-xl border border-gray-300"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleRemoveDiscountId}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#48AAD9] items-center justify-center border-2 border-white"
                        activeOpacity={0.8}
                      >
                        <Text className="text-white text-[11px] font-bold leading-none">✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="mt-4 bg-[#48AAD9] rounded-xl py-3 items-center justify-center"
                    onPress={() => {
                      if (!discountType || !discountIdNumber) {
                         setSubmitError('Please complete ID Type and ID Number before proceeding.');
                      } else {
                         setSubmitError('');
                         setIsDiscountConfirmed(true);
                         setCheckoutDraft({
                            ...getCheckoutDraft(),
                            discountType,
                            discountIdNumber,
                            discountIdImage,
                         });
                      }
                    }}
                  >
                    <Text className="text-xs text-white" style={styles.confirmPickupText}>Upload</Text>
                  </TouchableOpacity>
                </>
              )}

              {discountIdImage && isDiscountConfirmed && (
                <View className="mt-2 rounded-2xl bg-[#EEF7FD] p-4 flex-row items-center justify-between">
                  <View className="relative">
                    <TouchableOpacity
                      onPress={() => setExpandedImageUri(discountIdImage.uri)}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: discountIdImage.uri }}
                        className="w-36 h-24 rounded-xl"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                         setIsDiscountConfirmed(false);
                         handleRemoveDiscountId();
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#48AAD9] items-center justify-center border-2 border-white"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white text-[11px] font-bold leading-none">✕</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    className="px-8 py-2.5 rounded-xl border border-[#48AAD9] bg-white items-center justify-center min-w-[96px]"
                    onPress={() => setIsDiscountConfirmed(false)}
                  >
                    <Text className="text-xs" style={styles.primarySemiBold}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Info footer */}
            <View className="bg-[#CFE7F3] px-4 py-3 flex-row items-center border-t border-[#B9DEEF]">
              <BlueInfoIcon width={18} height={18} />
              <Text className="text-xs ml-2.5 flex-1" style={styles.discountInfoText}>
                Our pharmacist may ask you to present the original ID upon pickup.
              </Text>
            </View>
          </View>
        )}

        {/* Fullscreen Expandable Image Modal */}
        <Modal
          visible={!!expandedImageUri}
          transparent
          animationType="fade"
          onRequestClose={() => setExpandedImageUri(null)}
        >
          <View className="flex-1 bg-black/85 items-center justify-center p-4">
            <TouchableOpacity
              className="absolute top-12 right-6 z-10 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              onPress={() => setExpandedImageUri(null)}
            >
              <Text className="text-white text-lg font-bold">✕</Text>
            </TouchableOpacity>
            {expandedImageUri ? (
              <Image
                source={{ uri: expandedImageUri }}
                className="w-full h-4/6 rounded-xl"
                resizeMode="contain"
              />
            ) : null}
          </View>
        </Modal>

        {/* Payment Method Container */}
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 overflow-hidden">
          <View className="p-4">
            <Text className="text-sm mb-3" style={styles.fontSemiBold}>Payment Method</Text>

              <View className="gap-3">
                <TouchableOpacity
                  className="flex-row items-center justify-between py-1"
                  onPress={() => setPaymentMethod('cash')}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center flex-1">
                    <PaymentMethodIcon width={22} height={22} />
                    <Text className="text-xs ml-3" style={styles.fontMedium}>
                      Pay at Pharmacy (Cash)
                    </Text>
                  </View>
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${paymentMethod === 'cash' ? 'border-[#48AAD9]' : 'border-gray-400'}`}>
                    {paymentMethod === 'cash' && (
                      <View className="w-2.5 h-2.5 rounded-full bg-[#48AAD9]" />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-between py-1"
                  onPress={() => setPaymentMethod('gcash')}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center flex-1">
                    <GcashIcon width={22} height={22} />
                    <Text className="text-xs ml-3" style={styles.fontMedium}>
                      GCash QR / Scan to Pay
                    </Text>
                  </View>
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${paymentMethod === 'gcash' ? 'border-[#48AAD9]' : 'border-gray-400'}`}>
                    {paymentMethod === 'gcash' && (
                      <View className="w-2.5 h-2.5 rounded-full bg-[#48AAD9]" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

            <View className="border-t border-gray-100 my-3" />

            {/* Total Items & Estimated Total Row */}
            <View className="flex-row justify-between items-center">
              <Text className="text-xs" style={styles.fontMedium}>
                Total items: <Text style={styles.fontBold}>{totalItems}</Text>
              </Text>
              <Text className="text-xs" style={styles.fontMedium}>
                Estimated Total: <Text style={styles.fontBold}>₱{effectiveTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
              </Text>
            </View>
          </View>

          {/* Bottom Info Banner (#CFE7F3 background) */}
          <View className="bg-[#CFE7F3] px-4 py-3 flex-row items-center border-t border-[#B9DEEF]">
            <RedInfoIcon width={16} height={16} />
            <Text className="text-xs ml-2.5 flex-1" style={styles.paymentInfoText}>
              Final amount may change after pharmacist review.
            </Text>
          </View>
        </View>

        {/* GCash Payment Section */}
        {!hasPrescription && !discountIdImage && paymentMethod === 'gcash' && (
          <GcashPaymentSection
            onPickFromGallery={handlePickGcashReceiptFromGallery}
            onTakeImage={handleTakeGcashReceiptPhoto}
            receiptImage={gcashReceiptImage}
            onRemoveReceipt={handleRemoveGcashReceipt}
            wrapperStyle={{ marginHorizontal: 16 }}
            qrStyle={{ width: 240, height: 240 }}
          />
        )}

        {isPharmacyClosed && (
          <View className="flex-row items-start bg-[#FFF7ED] rounded-xl mx-4 mt-3 p-3 border border-[#FCD34D]">
            <RedInfoIcon width={14} height={14} />
            <View className="flex-1 ml-2">
              <Text className="text-xs" style={styles.closedWarningTitle}>Pharmacy is currently closed</Text>
              <Text className="text-[10px] mt-0.5" style={styles.closedWarningBody}>
                Orders can only be placed during operating hours ({formatMinutesToAmPm(openingMinutes)} – {formatMinutesToAmPm(closingMinutes)}). Please come back during open hours.
              </Text>
            </View>
          </View>
        )}
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

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl w-full p-6 shadow-xl">
            <Text className="text-lg text-center mb-4" style={styles.fontBold}>
              Confirm Pickup Request?
            </Text>
            <Text className="text-sm text-center mb-6" style={styles.fontMediumGray}>
              Are you sure you want to submit this pickup request? Once submitted, it cannot be edited.
            </Text>
            <View className="flex-row justify-between gap-3">
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 items-center border border-[#48AAD9] bg-white"
                onPress={() => setShowConfirmModal(false)}
              >
                <Text className="text-sm" style={[styles.fontSemiBold, { color: '#48AAD9' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 items-center bg-[#48AAD9]"
                onPress={actuallySubmitOrder}
              >
                <Text className="text-sm" style={[styles.fontSemiBold, { color: '#ffffff' }]}>Yes, Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default PickupDetailsScreen

const styles = StyleSheet.create({
  fontBold: {
    fontFamily: 'Poppins-Bold',
    color: '#444444',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: '#444444',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
    color: '#444444',
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
    minHeight: 52,
    fontSize: 11,
    color: '#444444',
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
  discountInfoText: {
    fontFamily: 'Poppins-Medium',
    color: '#444444',
    lineHeight: 16,
  },
  paymentInfoText: {
    fontFamily: 'Poppins-Medium',
    color: '#444444',
    lineHeight: 16,
  },
})

