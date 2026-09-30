import { StyleSheet, Text, View, TouchableOpacity, BackHandler, ScrollView } from 'react-native'
import React, { useCallback } from 'react'
import { useRouter, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@src/shared/theme/colorPalette'
import LogoHeader from '@src/shared/components/LogoHeader'
import OrderSuccessIcon from '@assets/icons/success_icon.svg'
import PickupRequestErrorIcon from '@assets/icons/pickup-request-error.svg'
import BlueClockIcon from '@assets/icons/blue_clock_icon.svg'
import BlueBasketIcon from '@assets/icons/orders_icon.svg'
import { clearCheckoutDraft } from '@shared/services/checkoutDraft'
import { useOrderSubmission } from '@shared/context/OrderSubmissionContext'

const OrderSubmittedScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { summary: summaryString, orderId } = useLocalSearchParams()
  const { lastSubmissionError, optimisticOrders } = useOrderSubmission()

  let summary = null
  try {
    if (summaryString) {
      summary = JSON.parse(summaryString)
    }
  } catch (e) {
    console.error("Failed to parse summary", e)
  }

  const currentOrder = orderId ? optimisticOrders.find(o => o.id === orderId) : null
  const hasFailed = Boolean(lastSubmissionError || currentOrder?.status === 'error')
  const failureReason = lastSubmissionError || currentOrder?.errorMessage

  useFocusEffect(
    useCallback(() => {
      if (!hasFailed) {
        clearCheckoutDraft()
      }

      const onBackPress = () => {
        if (hasFailed) {
          router.replace('/tabs/Home')
        }
        return true
      }

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )

      return () => backHandler.remove()
    }, [hasFailed, router])
  )

  // FAILED STATE: Renders exact layout matching user design asset
  if (hasFailed) {
    const displaySubtitle = failureReason && 
      typeof failureReason === 'string' && 
      !failureReason.includes('SQL') && 
      !failureReason.includes('Exception') &&
      !failureReason.includes('Call to') &&
      failureReason.length < 120
        ? failureReason
        : 'Something went wrong on our end.\nPlease try again in a few moments.'

    return (
      <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
        <Stack.Screen options={{ gestureEnabled: false, headerShown: false }} />
        <LogoHeader 
          showBackButton={true} 
          onBackPress={() => router.replace('/tabs/Home')}
          style={styles.errorHeader}
        />

        <View className="flex-1 justify-between px-6">
          {/* Center Illustration and Error Feedback */}
          <View className="flex-1 items-center justify-center -mt-10">
            <View className="items-center justify-center">
              <PickupRequestErrorIcon width={253} height={171} />
            </View>

            <View className="items-center mt-6">
              <Text className="text-2xl text-center" style={styles.errorTitleText}>
                Pickup Request Failed!
              </Text>
              <Text className="text-xs text-center mt-2 px-4" style={styles.errorSubtitleText}>
                {displaySubtitle}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <View className="w-full pb-6">
            <TouchableOpacity
              className="w-full rounded-xl py-3.5 items-center justify-center bg-[#48AAD9]"
              onPress={() => router.replace('/tabs/Home')}
              activeOpacity={0.85}
            >
              <Text className="text-sm text-white" style={styles.fontSemiBold}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  // SUCCESS STATE
  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <LogoHeader showBackButton={false} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="items-center px-6 mt-3">
          <View className="items-center justify-center">
            <OrderSuccessIcon width={260} height={164} />
          </View>

          <View className="items-center mt-6">
            <Text className="text-xl text-center" style={styles.titleText}>
              Pickup Request Submitted!
            </Text>
            <Text className="text-sm text-center mt-1 px-4" style={styles.subtitleText}>
              Your order has been submitted and is{'\n'}awaiting pharmacist review.
            </Text>
          </View>

          <View className="bg-white rounded-2xl border border-gray-200 w-full mt-3 p-3.5">
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
            <View className="bg-white rounded-2xl border border-gray-200 w-full mt-3 p-3.5">
              <View className="flex-row items-start mb-2.5">
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
                  <Text className="text-xs text-[#48AAD9]" style={styles.fontBold}>PHP {Number(summary.total).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-6 pt-2 pb-3 bg-[#F1F4FF]">
        <TouchableOpacity
          className="bg-[#48AAD9] rounded-xl py-2 items-center justify-center"
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
  errorHeader: {
    backgroundColor: '#48AAD9',
  },
  errorTitleText: {
    fontFamily: 'Poppins-Bold',
    color: '#EC5353',
  },
  errorSubtitleText: {
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    lineHeight: 20,
  },
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
