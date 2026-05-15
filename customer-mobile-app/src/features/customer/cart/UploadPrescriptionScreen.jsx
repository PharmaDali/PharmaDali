import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '@src/shared/theme/colorPalette'
import LogoHeader from '@src/shared/components/LogoHeader'
import StepIndicator from '@src/shared/components/StepIndicator'
import ProductImage from '@shared/components/ProductImage'
import { getCheckoutDraft, setCheckoutDraft } from '@shared/services/checkoutDraft'

const MAX_PRESCRIPTION_SIZE_BYTES = 5 * 1024 * 1024

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

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
  const draft = getCheckoutDraft()
  const { items } = draft
  const prescriptionItems = items.filter((item) => item.prescriptionRequired)
  const [imageUri, setImageUri] = useState(draft?.prescriptionImage?.uri || null)
  const [imageAsset, setImageAsset] = useState(draft?.prescriptionImage || null)
  const [confirmed, setConfirmed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(Boolean(draft?.prescriptionPrepared))
  const uploadTimerRef = useRef(null)
  const canProceed = uploadSuccess

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) {
        clearInterval(uploadTimerRef.current)
      }
    }
  }, [])

  const startUploadProgress = () => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current)
    }

    setUploadProgress(0)

    uploadTimerRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          return prev
        }

        return Math.min(90, prev + 6)
      })
    }, 120)
  }

  const stopUploadProgress = (isSuccess) => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current)
      uploadTimerRef.current = null
    }

    setUploadProgress(isSuccess ? 100 : 0)
  }

  const pickFromGallery = async () => {
    setUploadError('')
    setUploadSuccess(false)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setImageAsset(result.assets[0])
      setUploadSuccess(false)
    }
  }

  const takePhoto = async () => {
    setUploadError('')
    setUploadSuccess(false)
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setImageAsset(result.assets[0])
      setUploadSuccess(false)
    }
  }

  const clearImage = () => {
    setImageUri(null)
    setImageAsset(null)
    setConfirmed(false)
    setUploadError('')
    setUploadSuccess(false)
    setUploadProgress(0)

    const currentDraft = getCheckoutDraft()
    setCheckoutDraft({
      ...currentDraft,
      prescriptionImage: null,
      prescriptionPrepared: false,
    })
  }

  const handleUpload = async () => {
    if (!imageAsset) {
      setUploadError('Please select an image first.')
      return
    }

    if (!confirmed) {
      setUploadError('Please confirm prescription validity before uploading.')
      return
    }

    if (Number(imageAsset?.fileSize || 0) > MAX_PRESCRIPTION_SIZE_BYTES) {
      setUploadError('Image is too large. Maximum allowed size is 5 MB.')
      return
    }

    if (prescriptionItems.length === 0) {
      setUploadError('No prescription-required items found.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadSuccess(false)
    startUploadProgress()

    try {
      await sleep(800)

      const currentDraft = getCheckoutDraft()

      setCheckoutDraft({
        ...currentDraft,
        prescriptionImage: {
          uri: imageAsset.uri,
          fileName: imageAsset.fileName || `prescription-${Date.now()}.jpg`,
          mimeType: imageAsset.mimeType || 'image/jpeg',
        },
        prescriptionPrepared: true,
      })

      stopUploadProgress(true)
      await sleep(250)

      setUploadSuccess(true)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to prepare prescription image.')
      setUploadSuccess(false)
      stopUploadProgress(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <LogoHeader />

      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={1} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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

        <View className="mx-4 mt-5">
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
                <TouchableOpacity
                  className={`rounded-lg px-6 py-1.5 mt-3 ${uploading ? 'bg-gray-200 border border-gray-300' : 'border border-[#48AAD9]'}`}
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  <Text className="text-xs" style={uploading ? styles.fontMediumGray : styles.primarySemiBold}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Text>
                </TouchableOpacity>

                {uploading && (
                  <View className="w-full mt-3">
                    <View className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <View
                        className="h-full bg-[#48AAD9]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </View>
                    <Text className="text-[11px] text-gray-500 mt-1 text-right" style={styles.fontMedium}>
                      {Math.round(uploadProgress)}%
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                className="flex-row items-center mt-4"
                onPress={() => setConfirmed(!confirmed)}
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
          )}

          {!!uploadError && (
            <Text className="text-xs mt-3 text-[#B42318]" style={styles.fontMedium}>{uploadError}</Text>
          )}

          {uploadSuccess && (
            <Text className="text-xs mt-3 text-green-700" style={styles.fontMedium}>
              Prescription prepared. It will be uploaded after Confirm Pickup.
            </Text>
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
        <TouchableOpacity className={`flex-1 rounded-xl py-2.5 items-center ${canProceed ? 'bg-[#48AAD9]' : 'bg-gray-300'}`}
          onPress={() => {
            if (!canProceed) {
              return
            }

            router.push('/customer/tabs/cart/PickupDetails')
          }}
          disabled={!canProceed}
        >
          <Text className={`text-sm ${canProceed ? 'text-white' : 'text-gray-500'}`} style={styles.fontSemiBold}>Next</Text>
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
