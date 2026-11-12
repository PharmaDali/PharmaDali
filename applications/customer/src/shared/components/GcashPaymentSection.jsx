import React, { useState, useEffect } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native'
import DownloadIcon from '@assets/icons/download_icon.svg'
import GcashReceiptIcon from '@assets/icons/gcash_receipt_icon.svg'
import QrCodeImage from '@assets/images/qrcode_dummy.png'
import { getServerRoot, getStoredToken } from '@shared/api/client'
import * as FileSystem from 'expo-file-system/legacy'
import { Asset } from 'expo-asset'

const resolveQrUrl = (urlOrPath) => {
  if (!urlOrPath) return null;
  const target = typeof urlOrPath === 'string' ? urlOrPath : (urlOrPath.uri || '');
  if (!target || typeof target !== 'string') return null;

  const baseUrl = getServerRoot();

  // If it's a signed private media url
  if (target.includes('/api/media/private/')) {
    const pathAndQuery = target.substring(target.indexOf('/api/media/private/'));
    return `${baseUrl}${pathAndQuery}`;
  }

  // If it's a relative path starting with /
  if (target.startsWith('/')) {
    return `${baseUrl}${target}`;
  }

  // If it's a full URL, rebase to baseUrl if host differs
  if (target.startsWith('http://') || target.startsWith('https://')) {
    try {
      const parsed = new URL(target);
      if (baseUrl) {
        const baseParsed = new URL(baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`);
        if (parsed.host !== baseParsed.host) {
          return `${baseUrl}${parsed.pathname}${parsed.search}`;
        }
      }
      return target;
    } catch {
      return target;
    }
  }

  // If it's a private media relative storage path (e.g. payment_qrs/...)
  const clean = target.replace(/^\/?storage\//, '').replace(/^\/+/, '');
  if (
    clean.startsWith('payment_qrs/') ||
    clean.startsWith('prescriptions/') ||
    clean.startsWith('discount_ids/') ||
    clean.startsWith('payment_receipts/')
  ) {
    return `${baseUrl}/api/media/private/${clean}`;
  }

  return `${baseUrl}/storage/${clean}`;
};

export default function GcashPaymentSection({
  onPickFromGallery,
  onTakeImage,
  receiptImage,
  onRemoveReceipt,
  wrapperStyle = {},
  qrStyle = { width: 224, height: 224 },
  footer = null,
  qrCodeUrl = null,
  accountName = '',
  accountNumber = '',
}) {
  const [loadError, setLoadError] = useState(false)
  const [authToken, setAuthToken] = useState(null)

  useEffect(() => {
    let mounted = true
    getStoredToken().then((token) => {
      if (mounted && token) setAuthToken(token)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setLoadError(false)
  }, [qrCodeUrl])

  const resolvedQr = resolveQrUrl(qrCodeUrl)
  const imageHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : undefined
  const qrImageSource = (resolvedQr && !loadError)
    ? { uri: resolvedQr, ...(imageHeaders ? { headers: imageHeaders } : {}) }
    : QrCodeImage

  const [downloading, setDownloading] = useState(false)

  const handleDownloadQr = async () => {
    if (downloading) return
    try {
      setDownloading(true)
      let localUri = null

      if (resolvedQr && !loadError) {
        const filename = `gcash_qr_${Date.now()}.png`
        const targetPath = `${FileSystem.cacheDirectory}${filename}`
        const downloadResult = await FileSystem.downloadAsync(
          resolvedQr,
          targetPath,
          imageHeaders ? { headers: imageHeaders } : {}
        )
        localUri = downloadResult?.uri || targetPath
      } else {
        const asset = Asset.fromModule(QrCodeImage)
        await asset.downloadAsync()
        localUri = asset.localUri || asset.uri
      }

      if (!localUri) {
        throw new Error('Unable to prepare QR code image for saving.')
      }

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
        if (permissions.granted) {
          const base64Data = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
          })
          const fileName = `PharmaDali_GCash_QR_${Date.now()}`
          const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'image/png'
          )
          await FileSystem.writeAsStringAsync(safUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          })
          Alert.alert('Download Complete', 'GCash QR code has been saved to your selected folder.')
        }
      } else {
        Alert.alert('Download Complete', 'GCash QR code is ready.')
      }
    } catch (err) {
      console.warn('[GcashPaymentSection] Download error:', err)
      Alert.alert('Download Failed', err?.message || 'Failed to download QR code image.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <View className="bg-white rounded-2xl border border-gray-200 mt-3 p-5 items-center justify-center relative" style={wrapperStyle}>
        <TouchableOpacity
          className="absolute top-4 right-4 p-1 z-10"
          activeOpacity={0.7}
          onPress={handleDownloadQr}
          disabled={downloading}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#2AABE2" />
          ) : (
            <DownloadIcon width={24} height={24} />
          )}
        </TouchableOpacity>
        <Image
          source={qrImageSource}
          style={qrStyle}
          resizeMode="contain"
          onError={(e) => {
            console.warn('[GcashPaymentSection] Failed to load QR code image:', e?.nativeEvent?.error || e);
            setLoadError(true);
          }}
        />

        {(Boolean(accountName) || Boolean(accountNumber)) && (
          <View className="w-full mt-4 pt-3 border-t border-gray-100">
            <Text className="text-[11px] text-gray-500 uppercase tracking-wider mb-2 text-center" style={styles.fontSemiBold}>
              GCash Account Details
            </Text>
            <View className="bg-[#F4FAFD] border border-[#DCEFF9] rounded-xl p-3">
              {Boolean(accountName) && (
                <View className="flex-row items-center justify-between py-1">
                  <Text className="text-xs text-gray-500" style={styles.fontMedium}>Account Name</Text>
                  <Text className="text-xs text-gray-900" style={styles.fontSemiBold}>{accountName}</Text>
                </View>
              )}
              {Boolean(accountNumber) && (
                <View className={`flex-row items-center justify-between py-1 ${accountName ? 'border-t border-gray-100 mt-1' : ''}`}>
                  <Text className="text-xs text-gray-500" style={styles.fontMedium}>Mobile / GCash No.</Text>
                  <Text className="text-xs text-[#2AABE2]" style={styles.fontSemiBold}>{accountNumber}</Text>
                </View>
              )}
            </View>
          </View>
        )}
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
