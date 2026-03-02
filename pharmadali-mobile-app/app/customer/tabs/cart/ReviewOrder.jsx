import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@shared/colorPallete'
import RxIcon from '@assets/icons/rx_icon.svg'
import LogoHeader from '@shared/components/LogoHeader'
import RedLocationIcon from '@assets/icons/red_location_icon.svg'
import StepIndicator from '@shared/components/StepIndicator'
import RedInfoIcon from '@assets/icons/red_info_icon.svg'
import BandaidImg from '@assets/images/bandaid_img.png'
import BetadineImg from '@assets/images/betadine_img.png'

const orderItems = [
  {
    id: 1,
    img: BetadineImg,
    description: 'Imodium 2mg 4s - Diarrhea Medicine, Loperamide',
    price: 80.25,
    quantity: 1,
    size: '2mg',
    prescriptionRequired: false,
  },
  {
    id: 2,
    img: BetadineImg,
    description: 'LACRYVISC Carbomer 10g',
    price: 437.75,
    quantity: 1,
    size: '10g',
    prescriptionRequired: true,
  },
  {
    id: 3,
    img: BandaidImg,
    description: 'MEDIPLAST Sterilized Gauze Pads 4x4',
    price: 9.50,
    quantity: 1,
    size: '4x4',
    prescriptionRequired: false,
  },
]

function OrderItemRow({ item }) {
  return (
    <View className="flex-row mt-3">
      <Image source={item.img} className="w-16 h-16 rounded-lg" resizeMode="contain" />
      <View className="flex-1 ml-3">
        <Text className="text-xs" style={styles.fontSemiBold} numberOfLines={2}>
          {item.description}
        </Text>
        {item.prescriptionRequired && (
          <View className="flex-row items-center mt-1">
            <RxIcon width={12} height={12} />
            <Text className="text-[10px] ml-1" style={styles.rxText}>Prescription Required</Text>
          </View>
        )}
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm" style={styles.priceText}>
            ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          <View className="items-end">
            <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>{item.quantity}x</Text>
            <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>Size: {item.size}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const ReviewOrder = () => {
  const router = useRouter()
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const hasPrescription = orderItems.some((item) => item.prescriptionRequired)

  return (
    <SafeAreaView className="flex-1 bg-[#F1F4FF]" edges={['bottom']}>
      <LogoHeader />


      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={0} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        <View className="flex-row items-start mx-4 mt-4 mb-3">
          <RedLocationIcon width={18} height={18} />
          <View className="ml-2">
            <Text className="text-xs" style={styles.fontSemiBold}>Pickup at Burgos Street Branch</Text>
            <Text className="text-[10px] text-gray-500 mt-0.5" style={styles.fontMedium}>
              You can change this in the third step.
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 p-4">
          <Text className="text-sm" style={styles.fontBold}>Order Items</Text>

          {orderItems.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}

          <View className="border-b border-gray-200 my-3" />
          <View className="flex-row justify-between items-center">
            <Text className="text-sm" style={styles.fontBold}>Order Summary</Text>
            <Text className="text-sm" style={styles.priceText}>
              ₱ {total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
      <View className="flex-row justify-center gap-4 px-6 py-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 border border-[#48AAD9] rounded-xl py-2.5 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-sm" style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-[#48AAD9] rounded-xl py-2.5 items-center"
          onPress={() => router.push('/customer/tabs/cart/UploadPrescription')}
        >
          <Text className="text-sm text-white" style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default ReviewOrder

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