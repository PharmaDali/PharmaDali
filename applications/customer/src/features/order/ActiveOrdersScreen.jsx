import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@src/shared/theme/colorPalette'
import { StatusBadge, ProductRow } from '@src/shared/components/OrderComponents'
import CancelOrderOverlay from '@src/shared/components/CancelOrderOverlay'
import { cancelCustomerOrder } from '@shared/services/orderService'
import { useOrderSubmission } from '@shared/context/OrderSubmissionContext'

function ActiveOrderCard({ order, onCancel }) {
  const isOptimistic = order._isOptimistic;
  
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
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-sm" style={styles.textColorBold}>Order #{order.orderNumber}</Text>
          <Text className="text-xs text-gray-500 mt-1" style={styles.fontMedium}>{order.date}</Text>
        </View>
        {!isOptimistic && <StatusBadge status={order.status} />}
      </View>

      <View className="border-b border-gray-200 my-3" />

      {order.products.map((product, idx) => (
        <ProductRow key={idx} product={product} />
      ))}

      <View className="border-b border-gray-200 my-3" />

      <View className="flex-row justify-between items-center">
        <Text className="text-sm" style={styles.textColorBold}>Order Summary</Text>
        <Text className="text-sm" style={styles.primaryLabelBold}>{order.orderSummary}</Text>
      </View>

      {!isOptimistic && (
        <View className="items-center mt-4 mb-1">
          <TouchableOpacity className="rounded-xl border px-6 py-2" style={styles.cancelButton} onPress={onCancel}>
            <Text className="text-sm" style={styles.primaryLabelBold}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default function ActiveOrdersScreen({ orders = [], onOrderCancelled, refreshing, onRefresh }) {
  const { optimisticOrders } = useOrderSubmission()
  const allOrders = [...optimisticOrders, ...orders]
  
  const [cancelVisible, setCancelVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cancelError, setCancelError] = useState('')

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
          <ActiveOrderCard order={item} onCancel={() => handleCancelPress(item)} />
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
  primaryLabelBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  textColorBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  cancelButton: {
    borderColor: colors.buttonColor,
  },
})
