import { StyleSheet, Text, View, TouchableOpacity, BackHandler, ScrollView } from 'react-native'
import React, { useCallback } from 'react'
import { useRouter, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LogoHeader from '@src/shared/components/LogoHeader'
import PickupRequestErrorIcon from '@assets/icons/pickup-request-error.svg'

const OrderFailedScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { errorMessage } = useLocalSearchParams()

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/tabs/Home')
        return true
      }

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      )

      return () => backHandler.remove()
    }, [router])
  )

  const handleBackToHome = () => {
    router.replace('/tabs/Home')
  }

  // Display clean, user-friendly message matching the design
  const displaySubtitle = errorMessage && 
    typeof errorMessage === 'string' && 
    !errorMessage.includes('SQL') && 
    !errorMessage.includes('Exception') &&
    !errorMessage.includes('Call to') &&
    errorMessage.length < 120
      ? errorMessage
      : 'Something went wrong on our end.\nPlease try again in a few moments.'

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <Stack.Screen options={{ gestureEnabled: false, headerShown: false }} />
      <LogoHeader 
        showBackButton={true} 
        onBackPress={handleBackToHome}
        style={styles.header}
      />

      <View className="flex-1 justify-between px-6">
        {/* Center Illustration and Error Feedback */}
        <View className="flex-1 items-center justify-center -mt-10">
          <View className="items-center justify-center">
            <PickupRequestErrorIcon width={253} height={171} />
          </View>

          <View className="items-center mt-6">
            <Text className="text-2xl text-center" style={styles.errorTitle}>
              Pickup Request Failed!
            </Text>
            <Text className="text-xs text-center mt-2 px-4" style={styles.errorSubtitle}>
              {displaySubtitle}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View className="w-full pb-6">
          <TouchableOpacity
            className="w-full rounded-xl py-3.5 items-center justify-center bg-[#48AAD9]"
            onPress={handleBackToHome}
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

export default OrderFailedScreen

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#48AAD9',
  },
  errorTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#EC5353',
  },
  errorSubtitle: {
    fontFamily: 'Poppins-Medium',
    color: '#666666',
    lineHeight: 20,
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
})
