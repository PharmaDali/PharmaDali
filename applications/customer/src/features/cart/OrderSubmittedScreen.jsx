import { StyleSheet, Text, View, TouchableOpacity, BackHandler, ScrollView } from 'react-native'
import React, { useCallback } from 'react'
import { useRouter, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@src/shared/theme/colorPalette'
import LogoHeader from '@src/shared/components/LogoHeader'
import OrderSuccessIcon from '@assets/icons/success_icon.svg'
import BlueClockIcon from '@assets/icons/blue_clock_icon.svg'
import BlueBasketIcon from '@assets/icons/orders_icon.svg'
import { clearCheckoutDraft } from '@shared/services/checkoutDraft'

const OrderSubmittedScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { summary: summaryString } = useLocalSearchParams()
  
  let summary = null
  try {
    if (summaryString) {
      summary = JSON.parse(summaryString)
    }
  } catch (e) {
    console.error("Failed to parse summary", e)
  }

  useFocusEffect(
    useCallback(() => {
      clearCheckoutDraft()

      const onBackPress = () => {
        return true
      }

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )

      return () => backHandler.remove()
    }, [])
  )

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <LogoHeader showBackButton={false} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="items-center px-6 mt-6">
          <OrderSuccessIcon width={260} height={164} />

          <Text className="text-xl text-center mt-5" style={styles.titleText}>
            Pickup Request Submitted!
          </Text>
          <Text className="text-sm text-center mt-2 px-4" style={styles.subtitleText}>
            Your order has been submitted and is{'\n'}awaiting pharmacist review.
          </Text>

          <View className="bg-white rounded-2xl border border-gray-200 w-full mt-6 p-4">
            <View className="flex-row items-start">
              <BlueClockIcon width={20} height={20} />
              <View className="flex-1 ml-2">
                <Text className="text-sm" style={styles.fontBold}>Next Steps:</Text>
                <Text className="text-xs mt-1" style={styles.fontMediumGray}>
                  You will receive a notification once your order is approved by the pharmacist.
                </Text>
              </View>
            </View>
          </View>

          {summary && (
            <View className="bg-white rounded-2xl border border-gray-200 w-full mt-4 p-4">
              <View className="flex-row items-start mb-4">
                <BlueBasketIcon width={20} height={20} />
                <View className="flex-1 ml-2">
                  <Text className="text-sm" style={styles.fontBold}>Order Summary:</Text>
                </View>
              </View>

              <View className="border border-gray-200 rounded-xl overflow-hidden">
                <View className="p-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-xs text-gray-500" style={styles.fontMedium}>Order Number:</Text>
                    <Text className="text-xs text-black" style={styles.fontSemiBold}>Pending</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-xs text-gray-500" style={styles.fontMedium}>Order Date:</Text>
                    <Text className="text-xs text-black" style={styles.fontSemiBold}>{summary.orderDate}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-xs text-gray-500" style={styles.fontMedium}>Pickup Date:</Text>
                    <Text className="text-xs text-black" style={styles.fontSemiBold}>{summary.pickupDate}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500" style={styles.fontMedium}>Payment Method:</Text>
                    <Text className="text-xs text-black" style={styles.fontSemiBold}>{summary.paymentMethod}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center bg-[#E8F4FA] px-3 py-2">
                  <Text className="text-xs text-gray-500" style={styles.fontBold}>ITEM</Text>
                  <Text className="text-xs text-gray-500" style={styles.fontBold}>QTY.</Text>
                </View>

                <View className="px-3">
                  {summary.items.map((item, idx) => (
                    <View key={idx} className="flex-row justify-between items-start py-3 border-b border-gray-100">
                      <View className="flex-1 pr-4">
                        <Text className="text-xs text-black" style={styles.fontMedium}>{item.name}</Text>
                        {item.rx && (
                          <View className="flex-row items-center mt-1">
                            <View className="bg-red-500 rounded-full w-4 h-4 items-center justify-center mr-1">
                              <Text className="text-[8px] text-white font-bold">Rx</Text>
                            </View>
                            <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>Prescription Required</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-black" style={styles.fontMedium}>{item.qty}x</Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row justify-between items-center bg-[#E8F4FA] px-3 py-3 mt-2">
                  <Text className="text-xs text-black" style={styles.fontBold}>Total</Text>
                  <Text className="text-xs text-[#48AAD9]" style={styles.fontBold}>₱ {Number(summary.total).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-6 pt-2 pb-4 bg-[#F1F4FF]">
        <TouchableOpacity
          className="bg-[#48AAD9] rounded-xl py-3 items-center"
          onPress={() => router.replace('/tabs/orders/Orders')}
        >
          <Text className="text-sm text-white" style={styles.fontSemiBold}>View Orders</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default OrderSubmittedScreen

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  subtitleText: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
    color: '#333',
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
})

