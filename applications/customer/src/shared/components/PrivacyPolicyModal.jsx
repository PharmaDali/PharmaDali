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
                When registering and placing orders through PharmaDali, we collect personal information including your full name, date of birth, mobile number, address, and account email. When applicable to your order, we also collect uploaded medical prescriptions, Senior Citizen or PWD identification cards, online payment receipts, and pharmacist consultation images.
              </Text>
            </View>

            {/* Section 2 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                2. Purpose of Data Processing
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Collected information is utilized strictly to facilitate order fulfillment, verify medical prescriptions with licensed pharmacists, validate statutory discount eligibility, confirm electronic payments, coordinate branch pickup, and send order notifications.
              </Text>
            </View>

            {/* Section 3 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                3. Partner Pharmacy Disclosures & Pricing
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Your order information, prescription copies, and discount documentation are shared exclusively with the specific partner pharmacy fulfilling your order. Statutory discounts (Senior Citizen / PWD) are subject to each partner pharmacy's product pricing rules, as items that are already discounted cannot receive double discounts.
              </Text>
            </View>

            {/* Section 4 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                4. Data Security & RA 10173 Protection
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                PharmaDali enforces strict technical and organizational safeguards under the Data Privacy Act of 2012 (RA 10173). Sensitive uploads are isolated in non-public private storage, served only via short-lived cryptographically signed URLs with non-caching headers, restricted to authorized pharmacy personnel, and immediately overwritten and deleted on re-upload.
              </Text>
            </View>

            {/* Section 5 */}
            <View className="mb-4">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                5. Data Retention & Automated Disposal Schedule
              </Text>
              <Text className="text-xs text-slate-600 leading-5 mb-2" style={styles.fontMedium}>
                In compliance with National Privacy Commission (NPC) proportionality principles and healthcare regulations, uploaded files follow an automated retention and deletion schedule once an order reaches a final status:
              </Text>
              <Text className="text-xs text-slate-600 leading-5 mb-1.5" style={styles.fontMedium}>
                • Senior Citizen & PWD ID Photos: Automatically deleted 7 days after order completion (or 3 days if cancelled or overdue). Only textual audit details (discount type, ID number, and pharmacist verification timestamp) are kept for mandatory BIR tax compliance under RA 9994 and RA 10754.
              </Text>
              <Text className="text-xs text-slate-600 leading-5 mb-1.5" style={styles.fontMedium}>
                • Dispensed Prescriptions: Retained for 2 years (730 days) from completion as mandated by the Philippine Pharmacy Act (RA 10918) and FDA inspection rules, then automatically purged.
              </Text>
              <Text className="text-xs text-slate-600 leading-5 mb-1.5" style={styles.fontMedium}>
                • Unfulfilled Prescriptions: Automatically deleted 30 days after an order is cancelled or expires without dispensing.
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                • Payment Receipts & Consultation Images: Automatically deleted 90 days after order completion or chat closure (30 days if cancelled or overdue).
              </Text>
            </View>

            {/* Section 6 */}
            <View className="mb-6">
              <Text className="text-xs text-[#48AAD9] uppercase tracking-wider mb-1" style={styles.fontBold}>
                6. Data Subject Rights
              </Text>
              <Text className="text-xs text-slate-600 leading-5" style={styles.fontMedium}>
                Under RA 10173, you have the right to be informed, access, rectify, object to processing, or request deletion of your personal data, subject only to mandatory statutory record-keeping periods required by the FDA, DOH, and BIR.
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
