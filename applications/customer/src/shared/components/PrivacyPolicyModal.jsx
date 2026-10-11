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
import BlueInfoIcon from '@assets/icons/blue_info_icon.svg'

export default function PrivacyPolicyModal({ visible, onClose }) {
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
              <View className="mr-2.5">
                <BlueInfoIcon width={20} height={20} />
              </View>
              <View className="flex-1">
                <Text className="text-base text-slate-800" style={styles.fontBold}>
                  Privacy Policy
                </Text>
                <Text className="text-[11px] text-slate-400" style={styles.fontMedium}>
                  Republic Act No. 10173 Compliance Notice
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
                1. Information We Collect
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                When registering and placing orders through PharmaDali, we collect personal information including your full name, date of birth, mobile number, delivery address, and account email. For prescription and discounted orders, we also collect uploaded medical prescriptions and statutory discount identification documents.
              </Text>
            </View>

            {/* Section 2 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                2. Purpose of Data Processing
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Collected information is utilized strictly to facilitate order fulfillment, verify medical prescriptions with licensed pharmacists, validate client pharmacy discount policies, ensure accurate branch pickup coordination, and provide critical customer service notifications.
              </Text>
            </View>

            {/* Section 3 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                3. Partner Pharmacy Disclosures & Pricing
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Your order information, prescription copies, and discount documentation are shared directly with the specific client pharmacy fulfilling your order. Statutory discounts (Senior Citizen / PWD) are subject to each partner pharmacy's product pricing rules, as items that are already discounted cannot receive double discounts.
              </Text>
            </View>

            {/* Section 4 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                4. Data Security & RA 10173 Protection
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                PharmaDali enforces administrative, organizational, and physical safeguards in full adherence with the Philippine Data Privacy Act of 2012 (RA 10173). Access to sensitive health records and prescription data is restricted exclusively to authorized pharmacists and pharmacy personnel.
              </Text>
            </View>

            {/* Section 5 */}
            <View className="mb-6">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                5. Data Subject Rights & Retention
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                You retain the right to access, rectify, or request deletion of your personal account information, subject to mandatory prescription and medical record retention requirements mandated by the Department of Health (DOH) and the Food and Drug Administration (FDA).
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
