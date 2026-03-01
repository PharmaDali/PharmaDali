import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { colors } from '@shared/colorPallete'
import RedLocationIcon from '@assets/icons/red_location_icon.svg'
import LogoHeader from '@shared/components/LogoHeader'
import RedInfoIcon from '@assets/icons/red_info_icon.svg'
import StepIndicator from '@shared/components/StepIndicator'

const pickupDates = [
  'Today - Wed, January 4',
  'Tomorrow - Thu, January 5',
  'Fri, January 6',
]

const timeSlots = [
  '9 AM - 12 PM',
  '12 PM - 3 PM',
  '3 PM - 6 PM',
]

function RadioButton({ selected, onPress, label }) {
  return (
    <TouchableOpacity className="flex-row items-center py-1.5" onPress={onPress}>
      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
        selected ? 'border-[#48AAD9]' : 'border-gray-300'
      }`}>
        {selected && <View className="w-2.5 h-2.5 rounded-full bg-[#48AAD9]" />}
      </View>
      <Text className="text-xs ml-2" style={styles.fontMedium}>{label}</Text>
    </TouchableOpacity>
  )
}

const PickupDetails = () => {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(2)
  const [selectedTime, setSelectedTime] = useState(1)

  return (
    <View className="flex-1 bg-[#F1F4FF]">
      <LogoHeader />

      <View className="pb-2 border-b border-gray-100">
        <StepIndicator currentStep={2} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <RedLocationIcon width={18} height={18} />
              <Text className="text-xs ml-2" style={styles.fontSemiBold}>Pickup at Burgos Street Branch</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-xs" style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 p-4">
          <Text className="text-sm mb-2" style={styles.fontBold}>Pickup Date</Text>
          {pickupDates.map((date, index) => (
            <RadioButton
              key={index}
              selected={selectedDate === index}
              onPress={() => setSelectedDate(index)}
              label={date}
            />
          ))}

          <Text className="text-sm mt-4 mb-2" style={styles.fontBold}>Pickup Time Slot</Text>
          {timeSlots.map((slot, index) => (
            <RadioButton
              key={index}
              selected={selectedTime === index}
              onPress={() => setSelectedTime(index)}
              label={slot}
            />
          ))}
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-3 p-4">
          <Text className="text-sm mb-2" style={styles.fontBold}>Payment Method</Text>
          <View className="flex-row items-center">
            <View className="w-5 h-5 rounded-full border-2 border-[#48AAD9] items-center justify-center">
              <View className="w-2.5 h-2.5 rounded-full bg-[#48AAD9]" />
            </View>
            <Text className="text-xs ml-2" style={styles.fontMedium}>Pay at Pharmacy (Cash/GCash)</Text>
          </View>

          <View className="border-b border-gray-200 my-3" />

          <View className="flex-row justify-between items-center">
            <Text className="text-xs" style={styles.fontBold}>Total Items: 3</Text>
            <Text className="text-xs">
              <Text style={styles.fontBold}>Estimated Total: </Text>
              <Text style={styles.priceText}>₱4,027.50</Text>
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-[#E8F4FD] rounded-xl mx-4 mt-3 mb-4 p-3 border border-[#B8DEF0]">
          <RedInfoIcon width={14} height={14} />
          <Text className="text-[10px] text-gray-500 ml-2" style={styles.fontMedium}>
            Final amount may change after pharmacist review.
          </Text>
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
          onPress={() => router.push('/customer/tabs/cart/OrderSubmitted')}
        >
          <Text className="text-sm text-white" style={styles.confirmPickupText}>Confirm Pickup</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default PickupDetails

const styles = StyleSheet.create({
  fontBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  confirmPickupText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  changeText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  primarySemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
})