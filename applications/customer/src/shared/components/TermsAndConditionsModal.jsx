import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RedInfoIcon from '@assets/icons/red_info_icon.svg'

export default function TermsAndConditionsModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />

        <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl max-h-[85%] pt-3 shadow-2xl">
          {/* Top Handle */}
          <View className="items-center py-1">
            <View className="w-8 h-1 rounded-full bg-slate-200" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-3 border-b border-slate-100">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-lg bg-sky-50 items-center justify-center mr-2.5">
                <RedInfoIcon width={16} height={16} />
              </View>
              <View className="flex-1">
                <Text className="text-base text-slate-800" style={styles.fontBold}>
                  Terms & Conditions
                </Text>
                <Text className="text-[11px] text-slate-400" style={styles.fontMedium}>
                  PharmaDali Customer Service Agreement
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-slate-400">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Document Content */}
          <ScrollView showsVerticalScrollIndicator={false} className="px-6 py-4">
            {/* Section 1 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                1. Prescription & Dispensing Policy
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Prescription (Rx) medicines require a valid doctor’s prescription uploaded during checkout or presented upon store pickup. All uploaded prescriptions undergo review and verification by a licensed PharmaDali pharmacist prior to dispensing.
              </Text>
            </View>

            {/* Section 2 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                2. Senior Citizen & PWD Discount Terms
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Senior Citizen (RA 9994) and Persons with Disability (RA 10754) discounts require a valid OSCA/PWD ID and purchase booklet. Discount approvals are subject to verification against Philippine regulatory laws. Fake or altered IDs will result in order cancellation.
              </Text>
            </View>

            {/* Section 3 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                3. Order Pickup & Schedule Bounds
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Customers must collect scheduled pickup orders within store operating hours. Uncollected orders past 24 hours may be cancelled, and reserved stock will be returned to inventory.
              </Text>
            </View>

            {/* Section 4 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                4. Non-Returnable Goods Policy
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                In compliance with FDA and DOH health regulations, dispensed medicines, biologicals, and cold-chain items cannot be returned or exchanged once collected, except in cases of dispensing errors verified by the pharmacy.
              </Text>
            </View>

            {/* Section 5 */}
            <View className="mb-6">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                5. Data Privacy & Confidentiality
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Personal health data, prescription images, and ID documents collected are handled strictly in accordance with the Data Privacy Act of 2012 (RA 10173) and used solely for order processing and verification.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View className="px-6 pt-3 pb-6 border-t border-slate-100 bg-white">
            <TouchableOpacity
              className="w-full py-3 rounded-xl bg-[#48AAD9] items-center justify-center shadow-xs"
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text className="text-xs text-white" style={styles.fontSemiBold}>
                I Understand & Agree
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
  },
})

