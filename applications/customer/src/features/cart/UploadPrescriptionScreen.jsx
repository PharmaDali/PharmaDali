import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '@src/shared/theme/colorPalette'
import LogoHeader from '@src/shared/components/LogoHeader'
import StepIndicator from '@src/shared/components/StepIndicator'
import ProductImage from '@shared/components/ProductImage'
import RedInfoIcon from '@assets/icons/red_info_icon.svg'
import BlueInfoIcon from '@assets/icons/blue_info_icon.svg'
import { getCheckoutDraft, setCheckoutDraft } from '@shared/services/checkoutDraft'
import { formatPharmacyHoursLabel } from '@src/utils/pickupScheduleUtils'

const MAX_PRESCRIPTION_SIZE_BYTES = 5 * 1024 * 1024

function truncateText(value, maxLength = 48) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function PrescriptionItemRow({ item }) {
  const displayName = truncateText(item.description)

  return (
    <View className="flex-row items-center mt-3">
      <ProductImage
        source={item.img}
        product={item.product}
        categoryName={item?.category?.category_name}
        quantity={item.quantity}
        isPrescribed={item.prescriptionRequired}
        isAvailable={item.isAvailable}
        isOutOfStock={item.isOutOfStock}
        stock={item.stock}
        width={56}
        height={56}
        containerStyle={{ borderRadius: 8 }}
      />
      <View className="flex-1 ml-3">
        <Text className="text-xs" style={styles.fontMedium} numberOfLines={2}>
          {displayName}
        </Text>
      </View>
      <Text className="text-xs text-gray-500 ml-2" style={styles.fontMedium}>{item.quantity}x</Text>
    </View>
  )
}

const UploadPrescriptionScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scrollViewRef = useRef(null)
  const draft = getCheckoutDraft()
  const { items } = draft
  const prescriptionItems = items.filter((item) => item.prescriptionRequired)
  const [imageUri, setImageUri] = useState(draft?.prescriptionImage?.uri || null)
  const [imageAsset, setImageAsset] = useState(draft?.prescriptionImage || null)
  const [confirmed, setConfirmed] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [nextDisabled, setNextDisabled] = useState(false)
  const [cardLayoutY, setCardLayoutY] = useState(0)
  const [checkboxLayoutY, setCheckboxLayoutY] = useState(0)
  const isPharmacyOpen = draft?.isPharmacyOpen !== false
  const isPharmacyActive = draft?.isPharmacyActive !== false

  const effectiveHoursLabel = useMemo(() => {
    const raw = draft?.pharmacyHoursLabel || ''
    if (raw && !raw.toLowerCase().includes('unavail') && raw.toLowerCase() !== 'closed') {
      return raw
    }
    const target =
      draft?.selectedPharmacy ||
      draft?.items?.find((i) => i?.pharmacy?.opening_hour || i?.pharmacy?.openingHour)?.pharmacy ||
      draft?.items?.[0]?.pharmacy
    return formatPharmacyHoursLabel(target) || ''
  }, [draft?.pharmacyHoursLabel, draft?.selectedPharmacy, draft?.items])

  const handleSelectImage = (asset) => {
    if (!asset?.uri) return

    if (Number(asset?.fileSize || 0) > MAX_PRESCRIPTION_SIZE_BYTES) {
      setUploadError('Image is too large. Maximum allowed size is 5 MB.')
      setNextDisabled(true)
      return
    }

    setUploadError('')
    setNextDisabled(false)
    setImageUri(asset.uri)
    setImageAsset(asset)
    setConfirmed(false)

    const currentDraft = getCheckoutDraft()
    setCheckoutDraft({
      ...currentDraft,
      prescriptionImage: {
        uri: asset.uri,
        fileName: asset.fileName || `prescription-${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      },
      prescriptionPrepared: true,
    })
  }

  const pickFromGallery = async () => {
    setUploadError('')
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleSelectImage(result.assets[0])
    }
  }

  const takePhoto = async () => {
    setUploadError('')
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      setUploadError('Permission to access camera is required.')
      setNextDisabled(true)
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    })
    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleSelectImage(result.assets[0])
    }
  }

  const clearImage = () => {
    setImageUri(null)
    setImageAsset(null)
    setConfirmed(false)
    setUploadError('')
    setNextDisabled(false)

    const currentDraft = getCheckoutDraft()
    setCheckoutDraft({
      ...currentDraft,
      prescriptionImage: null,
      prescriptionPrepared: false,
    })
  }

  const handleToggleConfirm = () => {
    const nextVal = !confirmed
    setConfirmed(nextVal)
    if (nextVal) {
      setUploadError('')
      setNextDisabled(false)
    }
  }

  const handleNext = () => {
    if (!isPharmacyActive) {
      setUploadError('This pharmacy is temporarily inactive.')
      setNextDisabled(true)
      return
    }

    if (!imageUri) {
      setUploadError('Please upload your prescription first.')
      setNextDisabled(true)
      scrollViewRef.current?.scrollTo({ y: Math.max(0, cardLayoutY - 60), animated: true })
      return
    }

    if (!confirmed) {
      setUploadError('Please confirm the validity of your prescription.')
      setNextDisabled(true)
      scrollViewRef.current?.scrollTo({ y: Math.max(0, cardLayoutY + checkboxLayoutY - 80), animated: true })
      return
    }

    setUploadError('')
    setNextDisabled(false)
    router.push('/tabs/cart/PickupDetails')
  }

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <LogoHeader />

      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={1} />
      </View>

      <ScrollView ref={scrollViewRef} className="flex-1" showsVerticalScrollIndicator={false}>
        {!isPharmacyActive && (
          <View className="mx-4 mt-4 bg-[#FFEAEA] border border-[#FFCCCC] rounded-xl p-3 flex-row items-center">
            <RedInfoIcon width={18} height={18} />
            <View className="flex-1 ml-2.5">
              <Text className="text-xs text-[#B42318]" style={styles.fontSemiBold}>
                Pharmacy Temporarily Inactive
              </Text>
              <Text className="text-[11px] text-[#7A271A] mt-0.5" style={styles.fontMedium}>
                {draft?.closedPharmacyName || draft?.pharmacyLabel || 'This pharmacy'} is temporarily inactive and not accepting orders.
              </Text>
            </View>
          </View>
        )}

        {isPharmacyActive && !isPharmacyOpen && (
          <View className="mx-4 mt-4 bg-[#EFF8FF] border border-[#B2DDFF] rounded-xl p-3 flex-row items-start">
            <BlueInfoIcon width={18} height={18} style={{ marginTop: 2 }} />
            <View className="flex-1 ml-2.5">
              <Text className="text-xs" style={[styles.fontSemiBold, { color: '#444444' }]}>
                Store is currently closed
              </Text>
              <Text className="text-[11px] mt-0.5 leading-4" style={[styles.fontMedium, { color: '#444444' }]}>
                You can upload your prescription now. Pickup will be scheduled for tomorrow{effectiveHoursLabel ? ` (${effectiveHoursLabel})` : ''}.
              </Text>
            </View>
          </View>
        )}

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
          <Text className="text-sm" style={styles.fontBold}>Prescription Required for:</Text>
          {prescriptionItems.length === 0 && (
            <Text className="text-xs text-gray-500 mt-2" style={styles.fontMedium}>
              No prescription items in this order.
            </Text>
          )}
          {prescriptionItems.map((item) => (
            <PrescriptionItemRow key={item.id} item={item} />
          ))}
        </View>

        <View className="mx-4 mt-5 mb-5" onLayout={(e) => setCardLayoutY(e.nativeEvent.layout.y)}>
          <Text className="text-sm mb-3" style={styles.fontBold}>Upload Prescription</Text>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 rounded-xl border border-[#48AAD9] py-3 items-center" onPress={pickFromGallery}>
              <Text className="text-xs" style={styles.primarySemiBold}>Upload from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-xl bg-[#48AAD9] py-3 items-center" onPress={takePhoto}>
              <Text className="text-xs text-white" style={styles.fontSemiBold}>Take a Photo</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-2 rounded-lg bg-[#FFF9E8] border border-[#F6E1A6] px-3 py-2">
            <Text className="text-[11px] text-[#8A6A00]" style={styles.fontMedium}>
              Notice: Maximum prescription image size is 5 MB.
            </Text>
          </View>

          {imageUri && (
            <View className="bg-white rounded-2xl border border-gray-200 mt-4 p-4">
              <View className="items-center">
                <View className="w-full relative">
                  <Image source={{ uri: imageUri }} className="w-full h-40 rounded-lg" resizeMode="contain" />
                  <TouchableOpacity
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-500 items-center justify-center"
                    onPress={clearImage}
                  >
                    <Text className="text-white text-xs">✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View onLayout={(e) => setCheckboxLayoutY(e.nativeEvent.layout.y)}>
                <TouchableOpacity
                  className="flex-row items-center mt-4"
                  onPress={handleToggleConfirm}
                >
                  <View
                    className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                      confirmed ? 'bg-[#48AAD9] border-[#48AAD9]' : 'border-gray-300 bg-white'
                    }`}
                  >
                    {confirmed && <Text className="text-white text-[10px]">✓</Text>}
                  </View>
                  <Text className="flex-1 text-[10px]" style={styles.fontMediumGray}>
                    I confirm that this prescription is valid and issued by a licensed physician.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!!uploadError && (
            <View className="mt-3 bg-[#FFEAEA] border border-[#FFCCCC] rounded-xl p-3 flex-row items-center">
              <RedInfoIcon width={16} height={16} />
              <Text className="text-xs text-[#B42318] ml-2 flex-1" style={styles.fontMedium}>
                {uploadError}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="flex-row justify-center gap-4 px-6 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 border border-[#48AAD9] rounded-xl py-2.5 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-sm" style={styles.primarySemiBold}>Go back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 rounded-xl py-2.5 items-center ${nextDisabled ? 'bg-gray-300' : 'bg-[#48AAD9]'}`}
          onPress={handleNext}
          disabled={nextDisabled}
        >
          <Text className={`text-sm ${nextDisabled ? 'text-gray-500' : 'text-white'}`} style={styles.fontSemiBold}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default UploadPrescriptionScreen

const styles = StyleSheet.create({
  fontBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  fontMediumGray: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  primarySemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
})

