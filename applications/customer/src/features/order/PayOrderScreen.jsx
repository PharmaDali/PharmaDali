import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import GcashIcon from '@assets/icons/gcash_icon.svg'
import { fetchCustomerOrderDetails, uploadCustomerPaymentReceipt } from '@shared/services/orderService'
import GcashPaymentSection from '@shared/components/GcashPaymentSection'

export default function PayOrderScreen() {
  const router = useRouter()
  const { orderId, orderNumber } = useLocalSearchParams()
  const resolvedOrderId = String(orderId || '').replace(/[^0-9]/g, '')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [gcashReceiptImage, setGcashReceiptImage] = useState(null)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        const payload = await fetchCustomerOrderDetails(resolvedOrderId)
        setOrder(payload?.data || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order.')
      } finally {
        setLoading(false)
      }
    }
    if (resolvedOrderId) {
      loadOrder()
    }
  }, [resolvedOrderId])

  const handlePickGcashReceiptFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to grant permission to access the gallery.')
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selected = result.assets[0]
        setGcashReceiptImage(selected)
      }
    } catch (err) {
      console.warn('Gallery error:', err)
    }
  }

  const handleTakeGcashReceiptPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to grant permission to use the camera.')
        return
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const captured = result.assets[0]
        setGcashReceiptImage(captured)
      }
    } catch (err) {
      console.warn('Camera error:', err)
    }
  }

  const handleRemoveGcashReceipt = () => {
    setGcashReceiptImage(null)
  }

  const handleUpload = async () => {
    if (!gcashReceiptImage) {
      Alert.alert('Missing File', 'Please upload a screenshot or photo of your GCash payment receipt.')
      return
    }

    setSubmitting(true)
    try {
      await uploadCustomerPaymentReceipt(resolvedOrderId, gcashReceiptImage)
      Alert.alert('Success', 'Payment receipt uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ])
    } catch (err) {
      Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-[#EEF7FD] items-center justify-center">
        <ActivityIndicator size="large" color="#48AAD9" />
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#EEF7FD] items-center justify-center p-5">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-6 py-2 bg-[#48AAD9] rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const items = Array.isArray(order?.items) ? order.items : []
  const numItems = items.length
  
  const totalAmount = Number(order?.total_amount ?? 0)
  const subtotal = Number(order?.subtotal ?? 0)
  const discountAmount = Number(order?.discount_amount ?? 0)

  return (
    <SafeAreaView className="flex-1 bg-[#F1F4FF]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-2 px-4 py-4 elevation-2 shadow-sm">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-sm" style={styles.textColorBold}>Order #{order?.order_number || orderNumber}</Text>
            <View className="flex-row items-center">
              <GcashIcon width={16} height={16} />
              <Text className="text-[11px] ml-1" style={styles.fontSemiBold}>GCash</Text>
            </View>
          </View>
          <Text className="text-xs text-gray-500 mb-4" style={styles.fontMedium}>
            Total PHP {totalAmount.toFixed(2)}
          </Text>

          <View className="border-b border-gray-100 mb-3" />

          {items.map((item, idx) => {
            const product = item?.pharmacy_product?.product || {}
            const baseName = item?.product_name || product.brand_name || product.generic_name || product.product_name || 'Product'
            const strengthForm = [product.strength, product.form, product.size].filter(Boolean).join(' ')
            const description = strengthForm ? `${baseName} - ${strengthForm}` : baseName
            const size = product.size || product.strength || '-'
            
            return (
              <View key={idx} className="flex-row items-start py-2 border-b border-gray-50">
                <View className="flex-1 mr-2">
                  <Text className="text-[11px]" style={styles.fontMedium}>{description}</Text>
                  {product.is_prescribed ? (
                    <Text className="text-[10px] text-red-500 mt-0.5" style={styles.fontSemiBold}>Rx Prescription Required</Text>
                  ) : null}
                  <Text className="text-xs mt-1" style={styles.textColorBold}>₱{Number(item.unit_price_snapshot).toFixed(2)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[11px] text-gray-700" style={styles.fontMedium}>{item.quantity}x</Text>
                  <Text className="text-[10px] text-gray-500 mt-0.5" style={styles.fontMedium}>Size: {size}</Text>
                </View>
              </View>
            )
          })}

          <View className="mt-4 flex-row justify-between">
            <Text className="text-xs text-gray-500" style={styles.fontMedium}>No. of Items</Text>
            <Text className="text-xs text-gray-700" style={styles.fontMedium}>{numItems}</Text>
          </View>
          <View className="mt-1.5 flex-row justify-between">
            <Text className="text-xs text-gray-500" style={styles.fontMedium}>Order Subtotal</Text>
            <Text className="text-xs text-gray-700" style={styles.fontMedium}>{subtotal.toFixed(2)}</Text>
          </View>
          {discountAmount > 0 && (
            <View className="mt-1.5 flex-row justify-between">
              <Text className="text-xs text-gray-500" style={styles.fontMedium}>Discount</Text>
              <Text className="text-xs text-gray-700" style={styles.fontMedium}>-{discountAmount.toFixed(2)}</Text>
            </View>
          )}

          <View className="border-b border-gray-100 my-3" />
          
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm" style={styles.textColorBold}>Total Due</Text>
            <Text className="text-sm" style={styles.textColorBold}>PHP {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <GcashPaymentSection
          onPickFromGallery={handlePickGcashReceiptFromGallery}
          onTakeImage={handleTakeGcashReceiptPhoto}
          receiptImage={gcashReceiptImage}
          onRemoveReceipt={handleRemoveGcashReceipt}
          wrapperStyle={{ marginHorizontal: 16, shadowColor: '#000', elevation: 2 }}
        />

        <View className="mx-4 mt-2">

          <TouchableOpacity
            className={`mt-4 rounded-xl py-3.5 items-center justify-center ${gcashReceiptImage ? 'bg-[#48AAD9]' : 'bg-gray-300'}`}
            disabled={!gcashReceiptImage || submitting}
            onPress={handleUpload}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-sm text-white" style={styles.fontSemiBold}>
                Upload
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  textColorBold: {
    color: '#333333',
    fontFamily: 'Poppins-Bold',
  },
  primarySemiBold: {
    color: '#48AAD9',
    fontFamily: 'Poppins-SemiBold',
  },
  confirmPickupText: {
    fontFamily: 'Poppins-Bold',
  }
})
