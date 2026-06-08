import { ActivityIndicator, Text, View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { colors } from '@src/shared/theme/colorPalette'
import { StatusBadge, ProductRow } from '@src/shared/components/OrderComponents'
import RecitDummy from '@assets/images/recit_dummy.png'
import { fetchCustomerOrderDetails } from '@shared/services/orderService'
import { mapApiOrderToViewModel } from './orderMappers'

export default function ViewOrderDetailsScreen() {
  const { orderId, orderNumber } = useLocalSearchParams()
  const resolvedOrderId = Array.isArray(orderId) ? orderId[0] : orderId
  const resolvedOrderNumber = Array.isArray(orderNumber) ? orderNumber[0] : orderNumber
  const [prescriptionConfirmed, setPrescriptionConfirmed] = useState(false)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const loadOrder = async () => {
      setLoading(true)
      setErrorMessage('')

      try {
        const payload = await fetchCustomerOrderDetails(resolvedOrderId)
        if (mounted) {
          setOrder(mapApiOrderToViewModel(payload))
        }
      } catch (error) {
        if (mounted) {
          setOrder(null)
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load order details.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (!resolvedOrderId) {
      setLoading(false)
      setErrorMessage('Invalid order reference.')
      return () => {
        mounted = false
      }
    }

    loadOrder()

    return () => {
      mounted = false
    }
  }, [resolvedOrderId])

  if (loading) {
    return (
      <View className="flex-1 bg-[#F1F4FF] items-center justify-center px-6">
        <ActivityIndicator size="large" color={colors.buttonColor} />
        <Text className="text-xs text-gray-500 mt-3" style={styles.fontMedium}>Loading order details...</Text>
      </View>
    )
  }

  if (errorMessage || !order) {
    return (
      <View className="flex-1 bg-[#F1F4FF] items-center justify-center px-6">
        <View className="w-full bg-white border border-[#FFD7D7] rounded-2xl p-4">
          <Text className="text-sm text-[#B42318]" style={styles.textBold}>Unable to load order</Text>
          <Text className="text-xs text-[#B42318] mt-1" style={styles.fontMedium}>
            {errorMessage || 'Order data is unavailable.'}
          </Text>
          {!!resolvedOrderNumber && (
            <Text className="text-xs text-gray-500 mt-2" style={styles.fontMedium}>Reference: #{resolvedOrderNumber}</Text>
          )}
        </View>
      </View>
    )
  }

  const isRejected = ['Rejected', 'Cancelled'].includes(order.status)
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
