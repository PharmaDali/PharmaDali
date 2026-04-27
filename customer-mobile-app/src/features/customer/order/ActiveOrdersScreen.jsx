import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@src/shared/theme/colorPalette'
import { StatusBadge, ProductRow } from '@src/shared/components/OrderComponents'
import CancelOrderOverlay from '@src/shared/components/CancelOrderOverlay'

function ActiveOrderCard({ order, onCancel }) {
  return (
    <View className="border border-gray-200 bg-white rounded-2xl py-4 px-4 mt-4 mx-4 shadow-md elevation-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-sm" style={styles.textColorBold}>Order #{order.orderNumber}</Text>
          <Text className="text-xs text-gray-500 mt-1" style={styles.fontMedium}>{order.date}</Text>
        </View>
        <StatusBadge status={order.status} />
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

      <View className="items-center mt-4 mb-1">
        <TouchableOpacity className="rounded-xl border px-6 py-2" style={styles.cancelButton} onPress={onCancel}>
          <Text className="text-sm" style={styles.primaryLabelBold}>Cancel Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function ActiveOrdersScreen({ orders = [] }) {
  const [cancelVisible, setCancelVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const handleCancelPress = (order) => {
    setSelectedOrder(order)
    setCancelVisible(true)
  }

  const handleConfirmCancel = () => {
    // TODO: handle actual order cancellation logic
    setCancelVisible(false)
    setSelectedOrder(null)
  }

  if (!orders.length) {
    return (
      <View className="mx-4 mt-4 bg-white border border-gray-200 rounded-2xl p-5 items-center">
        <Text className="text-sm text-gray-600" style={styles.textColorBold}>No active orders yet</Text>
        <Text className="text-xs text-gray-500 mt-1" style={styles.fontMedium}>Your active orders will appear here.</Text>
      </View>
    )
  }

  return (
    <View className="mt-4 mb-4">
      {orders.map((order) => (
        <ActiveOrderCard key={order.id || order.orderNumber} order={order} onCancel={() => handleCancelPress(order)} />
      ))}

      <CancelOrderOverlay
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onConfirm={handleConfirmCancel}
      />
    </View>
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
