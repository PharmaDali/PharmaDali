import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@shared/colorPallete'
import LogoHeader from '@shared/components/LogoHeader'
import OrderSuccessIcon from '@assets/icons/success_icon.svg'
import BlueClockIcon from '@assets/icons/blue_clock_icon.svg'

const OrderSubmitted = () => {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-[#F1F4FF]" edges={['bottom']}>
      <LogoHeader />

      <View className="flex-1 items-center justify-center px-6">
        <OrderSuccessIcon width={260} height={164} />

        <Text className="text-xl text-center mt-5" style={styles.titleText}>
          Pickup Request Submitted!
        </Text>
        <Text className="text-sm text-center mt-2 px-4" style={styles.subtitleText}>
          Your order has been submitted and is{'\n'}awaiting pharmacist review.
        </Text>

        <View className="bg-white rounded-2xl border border-gray-200 w-full mt-8 p-4">
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
      </View>

      <View className="px-6 pb-4">
        <TouchableOpacity
          className="bg-[#48AAD9] rounded-xl py-3 items-center"
          onPress={() => router.replace('/customer/tabs/Home')}
        >
          <Text className="text-sm text-white" style={styles.fontSemiBold}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default OrderSubmitted

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
    color: colors.textColor,
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontMediumGray: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
})