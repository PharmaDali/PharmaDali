import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '@src/shared/theme/colorPalette'
import { StatusBadge, ProductRow } from '@src/shared/components/OrderComponents'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'

function CompletedOrderCard({ order, onViewDetails }) {
  return (
    <View className="border border-gray-200 bg-white rounded-2xl py-4 px-4 mt-4 mx-4 shadow-md elevation-2">
      <View className="flex-row justify-between items-start">
        <View>
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
        <TouchableOpacity className="flex-row items-center rounded-xl px-6 py-2" style={styles.viewDetailsButton} onPress={onViewDetails}>
          <Text className="text-sm text-white mr-1" style={styles.fontSemiBold}>View Details</Text>
          <ArrowForwardIcon width={13} height={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function CompletedOrdersScreen({ orders = [] }) {
  const router = useRouter()

  const handleViewDetails = (order) => {
    router.push({
      pathname: '/customer/tabs/orders/ViewOrderDetails',
      params: {
        orderId: String(order.id || ''),
        orderNumber: order.orderNumber,
      },
    })
  }

  if (!orders.length) {
    return (
      <View className="mx-4 mt-4 bg-white border border-gray-200 rounded-2xl p-5 items-center">
        <Text className="text-sm text-gray-600" style={styles.textColorBold}>No completed orders yet</Text>
        <Text className="text-xs text-gray-500 mt-1" style={styles.fontMedium}>Completed and cancelled orders will appear here.</Text>
      </View>
    )
  }

  return (
    <View className="mt-4 mb-4">
      {orders.map((order) => (
        <CompletedOrderCard key={order.id || order.orderNumber} order={order} onViewDetails={() => handleViewDetails(order)} />
      ))}
    </View>
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
    borderRadius: 12,
  },
})
