import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '@shared/colorPallete'
import RxIcon from '@assets/icons/rx_icon.svg'
import LogoHeader from '@shared/components/LogoHeader'
import StepIndicator from '@shared/components/StepIndicator'
import BetadineImg from '@assets/images/betadine_img.png'

const prescriptionItems = [
  {
    id: 1,
    img: BetadineImg,
    description: 'LACRYVISC Carbomer 10g',
    quantity: 1,
  },
]

function PrescriptionItemRow({ item }) {
  return (
    <View className="flex-row items-center mt-3">
      <Image source={item.img} className="w-14 h-14 rounded-lg" resizeMode="contain" />
      <View className="flex-1 ml-3">
        <Text className="text-xs" style={styles.fontMedium} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <Text className="text-xs text-gray-500 ml-2" style={styles.fontMedium}>{item.quantity}x</Text>
    </View>
  )
}

const UploadPrescription = () => {
  const router = useRouter()
  const [imageUri, setImageUri] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
    }
  }

  const clearImage = () => {
    setImageUri(null)
    setConfirmed(false)
  }

  return (
    <View className="flex-1 bg-[#F1F4FF]">
      <LogoHeader />

      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={1} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
          <Text className="text-sm" style={styles.fontBold}>Prescription Required for:</Text>
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
                <TouchableOpacity className="border border-[#48AAD9] rounded-lg px-6 py-1.5 mt-3">
                  <Text className="text-xs" style={styles.primarySemiBold}>Upload</Text>
                </TouchableOpacity>
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
        </View>
      </ScrollView>

      <View className="flex-row justify-center gap-4 px-6 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 border border-[#48AAD9] rounded-xl py-2.5 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-sm" style={styles.primarySemiBold}>Go back</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-[#48AAD9] rounded-xl py-2.5 items-center"
          onPress={() => router.push('/customer/tabs/cart/PickupDetails')}
        >
          <Text className="text-sm text-white" style={styles.fontSemiBold}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default UploadPrescription

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