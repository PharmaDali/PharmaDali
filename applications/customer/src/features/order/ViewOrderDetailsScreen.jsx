import { ActivityIndicator, Text, View, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, Pressable } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '@src/shared/theme/colorPalette'
import { StatusBadge, ProductRow } from '@src/shared/components/OrderComponents'
import CancelOrderOverlay from '@src/shared/components/CancelOrderOverlay'
import {
  fetchCustomerOrderDetails,
  cancelCustomerOrder,
  uploadCustomerDiscountId,
  uploadCustomerPaymentReceipt,
  confirmInStorePayment,
  acknowledgeDiscountNotice,
  removeRxItemsAndProceed,
} from '@shared/services/orderService'
import { uploadOrderItemPrescription } from '@shared/services/prescriptionService'
import { mapApiOrderToViewModel } from './orderMappers'

export default function ViewOrderDetailsScreen() {
  const router = useRouter()
  const { orderId, orderNumber } = useLocalSearchParams()
  const resolvedOrderId = Array.isArray(orderId) ? orderId[0] : orderId
  const resolvedOrderNumber = Array.isArray(orderNumber) ? orderNumber[0] : orderNumber
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [modalImage, setModalImage] = useState(null)

  // Standby Action State
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  // Cancel Modal State
  const [cancelVisible, setCancelVisible] = useState(false)
  const [cancelSubmitting, setCancelSubmitting] = useState(false)
  const [cancelError, setCancelError] = useState('')

  // Re-upload photo State
  const [reuploadImage, setReuploadImage] = useState(null)
  const [reuploading, setReuploading] = useState(false)
  const [reuploadSuccess, setReuploadSuccess] = useState('')
  const [reuploadError, setReuploadError] = useState('')

  const loadOrder = async () => {
    if (!resolvedOrderId) return
    setLoading(true)
    setErrorMessage('')

    try {
      const payload = await fetchCustomerOrderDetails(resolvedOrderId)
      setOrder(mapApiOrderToViewModel(payload))
    } catch (error) {
      setOrder(null)
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load order details.')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadOrder()

      const intervalId = setInterval(() => {
        if (!resolvedOrderId) return
        fetchCustomerOrderDetails(resolvedOrderId)
          .then(payload => setOrder(mapApiOrderToViewModel(payload)))
          .catch(console.error)
      }, 10000)

      return () => clearInterval(intervalId)
    }, [resolvedOrderId])
  )

  const handleConfirmReceipt = async () => {
    if (!order?.id) return
    setActionLoading(true)
    setActionError('')
    try {
      await confirmInStorePayment(order.id)
      await loadOrder()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to confirm.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDiscount = async () => {
    if (!order?.id) return
    setActionLoading(true)
    setActionError('')
    try {
      await acknowledgeDiscountNotice(order.id)
      await loadOrder()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to acknowledge.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveRxItems = async () => {
    if (!order?.id) return
    setActionLoading(true)
    setActionError('')
    try {
      await removeRxItemsAndProceed(order.id)
      await loadOrder()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to remove prescription items.')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0]
        setReuploadImage({
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || 'reupload.jpg',
        })
        setReuploadSuccess('')
        setReuploadError('')
      }
    } catch (err) {
      setReuploadError('Failed to pick photo.')
    }
  }

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        setReuploadError('Camera permission required.')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      })

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0]
        setReuploadImage({
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || 'reupload.jpg',
        })
        setReuploadSuccess('')
        setReuploadError('')
      }
    } catch (err) {
      setReuploadError('Failed to take photo.')
    }
  }

  const handleUploadPhotoSubmit = async () => {
    if (!reuploadImage || !order) return
    setReuploading(true)
    setReuploadError('')
    setReuploadSuccess('')

    try {
      const isDiscountIssue = order.discountRemarks?.toLowerCase().includes('rejected')
      const isReceiptIssue = order.note?.toLowerCase().includes('receipt') || order.paymentStatus === 'failed'

      if (isDiscountIssue) {
        await uploadCustomerDiscountId(order.id, reuploadImage)
      } else if (isReceiptIssue) {
        await uploadCustomerPaymentReceipt(order.id, reuploadImage)
      } else {
        const rxItem = order.products.find((p) => p.prescriptionRequired) || order.products[0]
        if (rxItem?.id) {
          await uploadOrderItemPrescription(rxItem.id, reuploadImage)
        } else {
          throw new Error('Could not identify item for prescription upload.')
        }
      }

      setReuploadSuccess('Photo re-uploaded successfully! Our pharmacist will review it.')
      setReuploadImage(null)
      await loadOrder()
    } catch (err) {
      setReuploadError(err instanceof Error ? err.message : 'Failed to upload photo.')
    } finally {
      setReuploading(false)
    }
  }

  const handleConfirmCancel = async (reason) => {
    if (!order?.id) return
    setCancelSubmitting(true)
    setCancelError('')

    try {
      await cancelCustomerOrder(order.id, reason)
      setCancelVisible(false)
      await loadOrder()
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order.')
    } finally {
      setCancelSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-[#F1F4FF] items-center justify-center px-6">
        <ActivityIndicator size="large" color={colors.buttonColor} />
        <Text className="text-xs text-gray-500 mt-3" style={styles.fontMedium}>Loading order details...</Text>
      </View>
    )
  }

  if (errorMessage || !order) {
    return (
      <View className="flex-1 bg-[#F1F4FF] items-center justify-center px-6">
        <View className="w-full bg-white border border-[#FFD7D7] rounded-2xl p-4">
          <Text className="text-sm text-[#B42318]" style={styles.textBold}>Unable to load order</Text>
          <Text className="text-xs text-[#B42318] mt-1" style={styles.fontMedium}>
            {errorMessage || 'Order data is unavailable.'}
          </Text>
          {!!resolvedOrderNumber && (
            <Text className="text-xs text-gray-500 mt-2" style={styles.fontMedium}>Reference: #{resolvedOrderNumber}</Text>
          )}
        </View>
      </View>
    )
  }

  const isStandBy = order.rawStatus === 'stand_by'
  const isCancellable = isStandBy || ['pending', 'reviewing', 'id_rejected', 'receipt_rejected'].includes(order.rawStatus)
  const onHoldNote = order.onHoldReason || order.cancellationReason || order.discountRemarks || order.note || order.reason || 'Order is on hold awaiting review.'

  const isReceiptRejected = order.rawStatus === 'receipt_rejected' || (isStandBy && (order.note?.toLowerCase().includes('receipt') || order.paymentStatus === 'failed'))
  const isDiscountRejected = order.rawStatus === 'id_rejected' || (isStandBy && order.discountRemarks?.toLowerCase().includes('rejected'))
  const isPrescriptionRejected = (order.rawStatus === 'stand_by' || order.status === 'Rejected') && !isReceiptRejected && !isDiscountRejected && (order.reason?.toLowerCase().includes('prescription') || order.cancellationReason?.toLowerCase().includes('prescription'))

  const isDiscountApproved = order.discountRemarks?.toLowerCase() === 'approved'
  const isReceiptApproved = order.paymentStatus === 'paid'

  return (
    <ScrollView className="flex-1 bg-[#F1F4FF]" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>


      {/* Main Order Card */}
      <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text className="text-sm" style={styles.textBold}>Order #{order.orderNumber}</Text>
            <Text className="text-xs text-gray-500 mt-1" style={styles.fontMedium}>{order.date}</Text>
          </View>
          <View style={{ flexShrink: 0 }}>
            <StatusBadge status={order.status} />
          </View>
        </View>

        <View className="border-b border-gray-200 my-3" />

        {order.products.map((product, idx) => (
          <ProductRow key={idx} product={product} />
        ))}

        <View className="border-b border-gray-200 my-3" />

        <View className="flex-row justify-between items-center">
          <Text className="text-sm" style={styles.textBold}>Order Summary</Text>
          <Text className="text-sm" style={styles.primarySemiBold}>{order.orderSummary}</Text>
        </View>

        {order.prescriptionImagePath && (
          <View className="mt-4 pt-3 border-t border-gray-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs" style={styles.textBold}>Submitted Prescription</Text>
              {isPrescriptionRejected ? (
                <View className="bg-red-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-red-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>✗ Rejected</Text>
                </View>
              ) : !['pending', 'reviewing', 'stand_by', 'cancelled'].includes(order.rawStatus) ? (
                <View className="bg-green-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-green-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>✓ Approved</Text>
                </View>
              ) : (
                <View className="bg-yellow-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-yellow-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>Pending</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setModalImage({ uri: order.prescriptionImagePath })}
            >
              <Image
                source={{ uri: order.prescriptionImagePath }}
                className="w-full h-44 rounded-xl border border-gray-200"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}

        {order.discountIdImagePath && (
          <View className="mt-4 pt-3 border-t border-gray-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs" style={styles.textBold}>Submitted Discount ID</Text>
              {isDiscountApproved ? (
                <View className="bg-green-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-green-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>✓ Approved</Text>
                </View>
              ) : isDiscountRejected ? (
                <View className="bg-red-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-red-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>✗ Rejected</Text>
                </View>
              ) : (
                <View className="bg-yellow-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-yellow-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>Pending</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setModalImage({ uri: order.discountIdImagePath })}
            >
              <Image
                source={{ uri: order.discountIdImagePath }}
                className="w-full h-32 rounded-xl border border-gray-200"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}

        {order.paymentReceiptImagePath && (
          <View className="mt-4 pt-3 border-t border-gray-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs" style={styles.textBold}>Submitted Receipt</Text>
              {isReceiptApproved ? (
                <View className="bg-green-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-green-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>✓ Approved</Text>
                </View>
              ) : isReceiptRejected ? (
                <View className="bg-red-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-red-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>✗ Rejected</Text>
                </View>
              ) : (
                <View className="bg-yellow-100 px-2 py-0.5 rounded flex-row items-center">
                  <Text className="text-yellow-700" style={{ fontSize: 10, fontFamily: 'Poppins-Bold' }}>Pending</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setModalImage({ uri: order.paymentReceiptImagePath })}
            >
              <Image
                source={{ uri: order.paymentReceiptImagePath }}
                className="w-full h-32 rounded-xl border border-gray-200"
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}

        {isPrescriptionRejected && (
          <View className="mt-4 pt-3 border-t border-gray-100">
            <Text className="text-[11px] text-gray-400 mb-1" style={styles.fontMedium}>Reason:</Text>
            <Text className="text-xs text-gray-700 leading-5" style={styles.fontMedium}>
              Your order has been rejected for the following reason: {onHoldNote}
            </Text>

            <View className="border-t border-dashed border-gray-200 my-4" />

            <Text className="text-[13px] mb-3" style={styles.textBold}>Upload Prescription</Text>
            
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                className="flex-1 rounded-xl border border-[#48AAD9] py-2.5 items-center"
                onPress={handlePickFromGallery}
              >
                <Text className="text-xs" style={styles.primarySemiBold}>Upload from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-xl bg-[#48AAD9] py-2.5 items-center"
                onPress={handleTakePhoto}
              >
                <Text className="text-xs text-white" style={styles.fontSemiBold}>Take a Photo</Text>
              </TouchableOpacity>
            </View>

            {reuploadImage && (
              <View className="mt-2 items-center bg-[#F4F9FD] p-2 rounded-xl border border-dashed border-[#B9DEEF]">
                <View className="w-full relative">
                  <Image
                    source={{ uri: reuploadImage.uri }}
                    className="w-full h-32 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-[#48AAD9] w-7 h-7 rounded-full items-center justify-center border-2 border-white"
                    onPress={() => setReuploadImage(null)}
                  >
                    <Text className="text-white text-[10px]" style={styles.fontSemiBold}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  className="bg-[#48AAD9] rounded-xl px-8 py-2.5 items-center w-full mt-3"
                  disabled={reuploading}
                  onPress={handleUploadPhotoSubmit}
                >
                  {reuploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-xs text-white" style={styles.fontSemiBold}>Upload</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View className="flex-row items-center mt-3 mx-1">
              <View className="w-[18px] h-[18px] rounded items-center justify-center bg-[#48AAD9] mr-2">
                <Text className="text-white" style={{ fontSize: 10 }}>✓</Text>
              </View>
              <Text className="text-[11px] text-gray-700 flex-1 leading-4" style={styles.fontMedium}>
                I confirm that this prescription is valid and issued by a licensed physician.
              </Text>
            </View>

            {!!reuploadSuccess && <Text className="text-xs text-green-600 mt-3 text-center" style={styles.fontMedium}>{reuploadSuccess}</Text>}
            {!!reuploadError && <Text className="text-xs text-red-500 mt-3 text-center" style={styles.fontMedium}>{reuploadError}</Text>}
          </View>
        )}

        {isDiscountRejected && (
          <View className="mt-4 pt-3 border-t border-gray-100">
            <Text className="text-[11px] text-gray-400 mb-1" style={styles.fontMedium}>Reason:</Text>
            <Text className="text-xs text-gray-700 leading-5" style={styles.fontMedium}>
              Your Discount ID has been rejected for the following reason: {onHoldNote}
            </Text>

            {!order.discountRemarks?.toLowerCase().includes('acknowledged') && (
              <>
                <View className="border-t border-dashed border-gray-200 my-4" />

                <View className="flex-row items-center mb-3 mx-1">
                  <View className="w-[18px] h-[18px] rounded items-center justify-center bg-[#48AAD9] mr-2">
                    <Text className="text-white" style={{ fontSize: 10 }}>!</Text>
                  </View>
                  <Text className="text-[11px] text-gray-700 flex-1 leading-4" style={styles.fontMedium}>
                    By clicking Acknowledge & Confirm, you agree to bring your physical ID to the pharmacy upon pickup.
                  </Text>
                </View>

                {actionError ? <Text className="text-xs text-red-500 mt-1 mb-2">{actionError}</Text> : null}
                <TouchableOpacity
                  className="bg-[#48AAD9] rounded-xl py-2.5 items-center w-full"
                  disabled={actionLoading}
                  onPress={handleConfirmDiscount}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-xs text-white" style={styles.fontSemiBold}>Acknowledge & Confirm</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {isReceiptRejected && (
          <View className="mt-4 pt-3 border-t border-gray-100">
            <Text className="text-[11px] text-gray-400 mb-1" style={styles.fontMedium}>Reason:</Text>
            <Text className="text-xs text-gray-700 leading-5" style={styles.fontMedium}>
              Your Payment Receipt has been rejected for the following reason: {onHoldNote}
            </Text>

            {!order.note?.toLowerCase().includes('acknowledged payment') && (
              <>
                <View className="border-t border-dashed border-gray-200 my-4" />

                <View className="flex-row items-center mb-3 mx-1">
                  <View className="w-[18px] h-[18px] rounded items-center justify-center bg-[#48AAD9] mr-2">
                    <Text className="text-white" style={{ fontSize: 10 }}>!</Text>
                  </View>
                  <Text className="text-[11px] text-gray-700 flex-1 leading-4" style={styles.fontMedium}>
                    By clicking Acknowledge & Pay in Store, you agree to pay for your order physically at the pharmacy upon pickup.
                  </Text>
                </View>

                {actionError ? <Text className="text-xs text-red-500 mt-1 mb-2">{actionError}</Text> : null}
                <TouchableOpacity
                  className="bg-[#48AAD9] rounded-xl py-2.5 items-center w-full"
                  disabled={actionLoading}
                  onPress={handleConfirmReceipt}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-xs text-white" style={styles.fontSemiBold}>Acknowledge & Pay in Store</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* Re-Upload Photo Section for On-Hold Orders */}
      {isStandBy && !isPrescriptionRejected && (
        <View className="bg-white rounded-2xl border border-gray-200 mx-4 mt-4 p-4">
          <Text className="text-sm mb-1" style={styles.textBold}>Upload Another Photo</Text>
          <Text className="text-xs text-gray-500 mb-3" style={styles.fontMedium}>
            If requested by the pharmacist, upload a new photo of your prescription, discount ID, or payment receipt.
          </Text>

          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity
              className="flex-1 rounded-xl border border-[#48AAD9] py-2.5 items-center"
              onPress={handlePickFromGallery}
            >
              <Text className="text-xs" style={styles.primarySemiBold}>Upload from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-xl bg-[#48AAD9] py-2.5 items-center"
              onPress={handleTakePhoto}
            >
              <Text className="text-xs text-white" style={styles.fontSemiBold}>Take a Photo</Text>
            </TouchableOpacity>
          </View>

          {reuploadImage && (
            <View className="mt-2 items-center">
              <Image
                source={{ uri: reuploadImage.uri }}
                className="w-full h-36 rounded-xl mb-3"
                resizeMode="cover"
              />
              <TouchableOpacity
                className="bg-[#48AAD9] rounded-xl px-8 py-2.5 items-center w-full"
                disabled={reuploading}
                onPress={handleUploadPhotoSubmit}
              >
                {reuploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-xs text-white" style={styles.fontSemiBold}>Submit New Photo</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!!reuploadSuccess && <Text className="text-xs text-green-600 mt-2" style={styles.fontMedium}>{reuploadSuccess}</Text>}
          {!!reuploadError && <Text className="text-xs text-red-500 mt-2" style={styles.fontMedium}>{reuploadError}</Text>}
        </View>
      )}

      {/* Cancel Order Action */}
      {isCancellable && !isPrescriptionRejected && (
        <View className="mx-4 mt-5 items-center">
          <TouchableOpacity
            className="rounded-xl border border-[#DC3545] px-8 py-2.5 bg-[#FFF0F0] items-center w-full"
            onPress={() => setCancelVisible(true)}
          >
            <Text className="text-sm font-semibold text-[#DC3545]">Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}

      <CancelOrderOverlay
        visible={cancelVisible}
        onClose={() => {
          if (!cancelSubmitting) setCancelVisible(false)
        }}
        onConfirm={handleConfirmCancel}
        submitting={cancelSubmitting}
        errorMessage={cancelError}
      />

      {modalImage && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setModalImage(null)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalImage(null)}>
            <Image source={modalImage} style={{ width: '90%', height: '80%', resizeMode: 'contain' }} />
          </Pressable>
        </Modal>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  textBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  fontMediumGray: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  primarySemiBold: {
    fontFamily: 'Poppins-SemiBold',
    color: '#48AAD9',
  },
})
