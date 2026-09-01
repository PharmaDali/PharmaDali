import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import DownloadIcon from '@assets/icons/download_icon.svg'
import GcashReceiptIcon from '@assets/icons/gcash_receipt_icon.svg'
import QrCodeImage from '@assets/images/qrcode_dummy.png'

export default function GcashPaymentSection({
  onPickFromGallery,
  onTakeImage,
  receiptImage,
  onRemoveReceipt,
  wrapperStyle = {},
  qrStyle = { width: 224, height: 224 },
  footer = null,
}) {
  return (
    <>
      <View className="bg-white rounded-2xl border border-gray-200 mt-3 p-5 items-center justify-center relative" style={wrapperStyle}>
        <TouchableOpacity className="absolute top-4 right-4 p-1 z-10" activeOpacity={0.7}>
          <DownloadIcon width={24} height={24} />
        </TouchableOpacity>
        <Image
          source={QrCodeImage}
          style={qrStyle}
          resizeMode="contain"
        />
      </View>

      <View className="bg-white rounded-2xl border border-gray-200 mt-3 p-4" style={wrapperStyle}>
        <Text className="text-sm" style={styles.fontSemiBold}>
          GCash QR / Scan to Pay Receipt
        </Text>
        <Text className="text-xs text-gray-600 mt-1 mb-3" style={styles.fontMedium}>
          Upload a screenshot or photo of your Gcash payment receipt. Make sure the payment details are visible.
        </Text>

        <View className="flex-row items-center mb-4 py-1">
          <GcashReceiptIcon width={28} height={28} />
          <View className="ml-3 flex-1">
            <Text className="text-xs" style={styles.fontMedium}>
              Accepted: Gcash receipt screenshot or photo
            </Text>
            <Text className="text-[10px] text-gray-500 mt-0.5" style={styles.fontMedium}>
              File Format: JPG PNG (Max. 5MB)
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between gap-3 mb-4">
          <TouchableOpacity
            className="flex-1 border border-[#48AAD9] rounded-xl py-3 items-center justify-center bg-white"
            onPress={onPickFromGallery}
          >
            <Text className="text-[13px] text-[#48AAD9]" style={styles.fontMedium}>
              Upload from Gallery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#48AAD9] rounded-xl py-3 items-center justify-center"
            onPress={onTakeImage}
          >
            <Text className="text-[13px] text-white" style={styles.fontMedium}>
              Take a Photo
            </Text>
          </TouchableOpacity>
        </View>

        {receiptImage && (
          <View className="border border-[#89C5E5] rounded-2xl p-3" style={{ borderStyle: 'dashed', backgroundColor: '#F4FAFD' }}>
            <View className="relative w-full rounded-xl overflow-hidden" style={{ height: 180, backgroundColor: '#E2E8F0' }}>
              <Image source={receiptImage} className="w-full h-full" resizeMode="contain" />
              
              <TouchableOpacity 
                onPress={onRemoveReceipt} 
                className="absolute top-0 right-0 bg-[#65B7DF] w-8 h-8 items-center justify-center z-10"
                style={{ borderBottomLeftRadius: 12 }}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontFamily: 'Poppins-Bold', lineHeight: 22, marginTop: -2 }}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {footer && <View className="mt-4">{footer}</View>}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
})
