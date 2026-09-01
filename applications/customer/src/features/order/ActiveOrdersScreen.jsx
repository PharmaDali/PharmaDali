import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { colors } from '@src/shared/theme/colorPalette'
import { StatusBadge, ProductRow } from '@src/shared/components/OrderComponents'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'
import CancelOrderOverlay from '@src/shared/components/CancelOrderOverlay'
import { cancelCustomerOrder, confirmInStorePayment, acknowledgeDiscountNotice, removeRxItemsAndProceed } from '@shared/services/orderService'
import { useOrderSubmission } from '@shared/context/OrderSubmissionContext'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'

function ActiveOrderCard({ order, onViewDetails, onPay, onCancel }) {
  const isOptimistic = order._isOptimistic;
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMultipleProducts = order.products?.length > 1;
  const displayedProducts = isExpanded ? order.products : order.products?.slice(0, 1);

  return (
    <View className={`border ${isOptimistic ? 'border-[#48AAD9]' : 'border-gray-200'} bg-white rounded-2xl py-4 px-4 mt-4 mx-4 shadow-md elevation-2`}>
      {isOptimistic && (
        <View className="bg-[#EEF7FD] px-3 py-1.5 rounded-lg mb-3 flex-row items-center justify-between">
          <Text className="text-xs" style={styles.primaryLabelBold}>
            {order.status === 'error' ? 'Submission Failed' : 'Submitting Order...'}
          </Text>
          {order.status === 'submitting' && (
             <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>Working...</Text>
          )}
        </View>
      )}

      {/* Header: Order number + date + badge */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-sm" style={styles.textColorBold}>Order #{order.orderNumber}</Text>
          <Text className="text-xs text-gray-500 mt-0.5" style={styles.fontMedium}>{order.date}</Text>
        </View>
        {!isOptimistic && <StatusBadge status={order.status} />}
      </View>

      <View className="border-b border-gray-200 my-3" />

      {/* Product rows */}
      <View className="relative overflow-hidden pb-3">
        {displayedProducts?.map((product, idx) => (
          <ProductRow key={idx} product={product} />
        ))}
        
        {hasMultipleProducts && !isExpanded && (
          <TouchableOpacity 
            className="absolute bottom-0 left-0 right-0 items-center justify-end z-10" 
            style={{ height: 45 }}
            onPress={() => setIsExpanded(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)', '#FFFFFF']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 45 }}
              pointerEvents="none"
            />
            <View className="flex-row items-center mb-0">
              <Text className="text-[12px] text-[#48AAD9]" style={{ fontFamily: 'Poppins-Bold' }}>See {order.products.length - 1} more</Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color="#48AAD9" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
        )}
        
        {hasMultipleProducts && isExpanded && (
          <TouchableOpacity 
            className="items-center justify-center py-2 mt-2 flex-row" 
            onPress={() => setIsExpanded(false)}
            activeOpacity={0.7}
          >
            <Text className="text-[12px] text-[#48AAD9]" style={{ fontFamily: 'Poppins-Bold' }}>See less</Text>
            <MaterialCommunityIcons name="chevron-up" size={16} color="#48AAD9" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        )}
      </View>

      <View className="border-b border-gray-200 my-3" />

      {/* Order Summary row */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm" style={styles.textColorBold}>Order Summary</Text>
        <Text className="text-sm" style={styles.primaryLabelBold}>{order.orderSummary}</Text>
      </View>

      {/* Action buttons */}
      {!isOptimistic && (
        <View className="mt-4 mb-1">
          {order.rawStatus === 'awaiting_payment' ? (
            <View className="flex-row w-full gap-2.5">
              <TouchableOpacity
                className="flex-1 rounded-xl py-2.5 items-center justify-center border border-gray-400"
                style={{ backgroundColor: '#FFFFFF' }}
                onPress={onCancel}
              >
                <Text className="text-sm text-gray-700" style={styles.fontSemiBold}>Cancel Order</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-xl py-2.5 items-center justify-center"
                style={{ backgroundColor: '#48AAD9' }}
                onPress={onPay}
              >
                <Text className="text-sm text-white" style={styles.fontSemiBold}>Pay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <TouchableOpacity
                className="flex-row items-center rounded-xl px-6 py-2"
                style={styles.viewDetailsButton}
                onPress={onViewDetails}
              >
                <Text className="text-sm text-white mr-1" style={styles.fontSemiBold}>View Details</Text>
                <ArrowForwardIcon width={13} height={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default function ActiveOrdersScreen({ orders = [], onOrderCancelled, refreshing, onRefresh }) {
  const router = useRouter()
  const { optimisticOrders } = useOrderSubmission()
  const allOrders = [...optimisticOrders, ...orders]
  
  const [cancelVisible, setCancelVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const handleViewDetails = (order) => {
    router.push({
      pathname: '/tabs/orders/ViewOrderDetails',
      params: {
        orderId: String(order.id || ''),
        orderNumber: order.orderNumber,
      },
    })
  }

  const handleCancelPress = (order) => {
    setSelectedOrder(order)
    setCancelError('')
    setCancelVisible(true)
  }

  const handleConfirmCancel = async (reason) => {
    if (!selectedOrder?.id) return

    setSubmitting(true)
    setCancelError('')

    try {
      await cancelCustomerOrder(selectedOrder.id, reason)
      setCancelVisible(false)
      setSelectedOrder(null)
      if (typeof onOrderCancelled === 'function') {
        onOrderCancelled()
      }
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayOrder = (order) => {
    router.push({
      pathname: '/tabs/orders/PayOrder',
      params: {
        orderId: String(order.id || ''),
        orderNumber: order.orderNumber,
      },
    })
  }

  if (!allOrders.length) {
    return (
      <View className="mx-4 mt-4 bg-white border border-gray-200 rounded-2xl p-5 items-center">
        <Text className="text-sm text-gray-600" style={styles.textColorBold}>No active orders</Text>
        <Text className="text-xs text-gray-500 mt-1" style={styles.fontMedium}>Your active and pending orders will appear here.</Text>
      </View>
    )
  }

  return (
    <>
      <FlatList
        data={allOrders}
        keyExtractor={(item) => String(item.id || item.orderNumber)}
        renderItem={({ item }) => (
          <ActiveOrderCard
            order={item}
            onViewDetails={() => handleViewDetails(item)}
            onPay={() => handlePayOrder(item)}
            onCancel={() => handleCancelPress(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <CancelOrderOverlay
        visible={cancelVisible}
        onClose={() => {
          if (!submitting) {
            setCancelVisible(false)
            setSelectedOrder(null)
          }
        }}
        onConfirm={handleConfirmCancel}
        submitting={submitting}
        errorMessage={cancelError}
      />
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
  primaryLabelBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  textColorBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  viewDetailsButton: {
    backgroundColor: colors.buttonColor,
  },
})
