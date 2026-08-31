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

        {!receiptImage ? (
          <View className="flex-row justify-between gap-2.5">
            <TouchableOpacity
              className="flex-[1.25] border border-[#48AAD9] rounded-xl py-3 items-center justify-center bg-white"
              onPress={onPickFromGallery}
            >
              <Text className="text-xs text-[#48AAD9]" style={styles.fontSemiBold}>
                Upload from Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-[0.75] bg-[#48AAD9] rounded-xl py-3 items-center justify-center"
              onPress={onTakeImage}
            >
              <Text className="text-xs text-white" style={styles.fontSemiBold}>
                Take Image
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row items-center justify-between border border-gray-200 rounded-xl p-3">
            <View className="flex-row items-center flex-1">
              <Image source={receiptImage} className="w-10 h-10 rounded-md bg-gray-100" resizeMode="cover" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-800" style={styles.fontSemiBold} numberOfLines={1}>
                  payment_receipt.jpg
                </Text>
                <Text className="text-[10px] text-[#10B981] mt-0.5" style={styles.fontMedium}>
                  ✓ Attached successfully
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onRemoveReceipt} className="p-2 ml-2">
              <Text className="text-[11px] text-[#DC3545]" style={styles.fontMedium}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
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
