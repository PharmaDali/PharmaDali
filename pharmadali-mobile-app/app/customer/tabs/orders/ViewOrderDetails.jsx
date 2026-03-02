import { Text, View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '@shared/colorPallete'
import { StatusBadge, ProductRow } from '@shared/components/OrderComponents'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'
import BetadineImg from '@assets/images/betadine_img.png'
import RecitDummy from '@assets/images/recit_dummy.png'

const orderData = {
  '04': {
    orderNumber: '04',
    date: 'January 10, 2026, 10:00am',
    status: 'Rejected',
    products: [
      { img: BetadineImg, description: 'Acnetrex Isotretinoin 20mg 20 Softgel Capsule', price: '₱1,530.00', quantity: 1, size: '20mg', prescriptionRequired: true },
    ],
    reason: 'Your order has been rejected for the following reason:\nA Medical Prescription is required.',
  },
  '05': {
    orderNumber: '05',
    date: 'January 20, 2026, 10:00am',
    status: 'Completed',
    products: [
      { img: BetadineImg, description: 'Tolak Angin Care Essential Oil Roll On 10ml', price: '₱50.00', quantity: 1, size: '10ml' },
    ],
    reason: null,
  },
}

const ViewOrderDetails = () => {
  const { orderNumber } = useLocalSearchParams()
  const router = useRouter()
  const [prescriptionConfirmed, setPrescriptionConfirmed] = useState(false)

  const order = orderData[orderNumber] || orderData['04']
  const isRejected = order.status === 'Rejected'
  const hasPrescriptionProduct = order.products.some((p) => p.prescriptionRequired)

  return (
    <ScrollView className="flex-1 bg-[#F1F4FF]" showsVerticalScrollIndicator={false}>
      <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-sm" style={styles.textBold}>Order #{order.orderNumber}</Text>
            <Text className="text-xs text-gray-500 mt-1" style={styles.fontMedium}>{order.date}</Text>
          </View>
          <StatusBadge status={order.status} />
        </View>

        <View className="border-b border-gray-200 my-3" />

        {order.products.map((product, idx) => (
          <ProductRow key={idx} product={product} />
        ))}
      </View>

      {order.reason && (
        <View className="mx-4 mt-4">
          <Text className="text-sm mb-1" style={styles.textBold}>Reason:</Text>
          <Text className="text-sm leading-5" style={styles.fontMediumGray}>{order.reason}</Text>
        </View>
      )}

      {isRejected && hasPrescriptionProduct && (
        <View className="mx-4 mt-6">
          <Text className="text-base mb-3" style={styles.textBold}>Upload Prescription</Text>

          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity className="flex-1 rounded-xl border border-[#48AAD9] py-3 items-center">
              <Text className="text-sm" style={styles.primarySemiBold}>Upload from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-xl bg-[#48AAD9] py-3 items-center">
              <Text className="text-sm text-white" style={styles.fontSemiBold}>Take a Photo</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 p-4 items-center">
            <Image
              source={RecitDummy}
              className="w-full h-40 rounded-lg mb-3"
              resizeMode="contain"
            />
            <TouchableOpacity className="bg-[#48AAD9] rounded-lg px-8 py-2">
              <Text className="text-sm text-white" style={styles.fontSemiBold}>Upload</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-center mt-4 mb-6"
            onPress={() => setPrescriptionConfirmed(!prescriptionConfirmed)}
          >
            <View className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${prescriptionConfirmed ? 'bg-[#48AAD9] border-[#48AAD9]' : 'border-gray-300 bg-white'}`}>
              {prescriptionConfirmed && <Text className="text-white text-xs">✓</Text>}
            </View>
            <Text className="flex-1 text-xs" style={styles.fontMediumGray}>
              I confirm that this prescription is valid and issued by a licensed physician.
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

export default ViewOrderDetails

const styles = StyleSheet.create({
  textBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  fontMediumGray: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  primarySemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: '#48AAD9',
  },
})