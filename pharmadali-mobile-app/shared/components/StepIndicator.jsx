import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '@shared/colorPallete'
import ReviewOrderIcon from '@assets/icons/review_order_icon.svg'
import UploadPrescriptionIcon from '@assets/icons/upload_prescription_icon.svg'
import PickupDetailsIcon from '@assets/icons/pickup_details_icon.svg'

const stepLabels = [
  'Review Order',
  'Upload Prescription',
  'Pickup Details',
]

const stepIcons = [
  (active) => <ReviewOrderIcon width={18} height={18} color={active ? '#fff' : '#48AAD9'} />,
  (active) => <UploadPrescriptionIcon width={18} height={18} color={active ? '#fff' : '#48AAD9'} />,
  (active) => <PickupDetailsIcon width={18} height={18} color={active ? '#fff' : '#48AAD9'} />,
]

export default function StepIndicator({ currentStep }) {
  return (
    <View className="items-center mt-2 mb-3">
      <View className="flex-row items-center justify-center">
        {stepIcons.map((iconFn, index) => (
          <React.Fragment key={index}>
            <View
              className={`w-9 h-9 rounded-full items-center justify-center overflow-hidden ${
                index <= currentStep ? 'bg-[#48AAD9]' : 'bg-white'
              }`}
            >
              {iconFn(index <= currentStep)}
            </View>
            {index < stepIcons.length - 1 && (
              <View
                className={`h-[2px] w-16 ${
                  index < currentStep ? 'bg-[#48AAD9]' : 'bg-[#D0E4ED]'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      <Text className="text-sm mt-2" style={styles.stepText}>
        Step {currentStep + 1} of 3 - {stepLabels[currentStep]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  stepText: {
    fontFamily: 'Poppins-Medium',
    color: colors.buttonColor,
  },
})
