import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '@src/shared/theme/colorPalette'
import { StatusBadge, ProductRow } from '@src/shared/components/OrderComponents'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'

import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState } from 'react'

function CompletedOrderCard({ order, onViewDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMultipleProducts = order.products?.length > 1;
  const displayedProducts = isExpanded ? order.products : order.products?.slice(0, 1);

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

export default function CompletedOrdersScreen({ orders = [], refreshing, onRefresh }) {
  const router = useRouter()

  const handleViewDetails = (order) => {
    router.push({
      pathname: '/tabs/orders/ViewOrderDetails',
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
    <FlatList
      data={orders}
      keyExtractor={(item) => String(item.id || item.orderNumber)}
      renderItem={({ item }) => (
        <CompletedOrderCard order={item} onViewDetails={() => handleViewDetails(item)} />
      )}
      contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
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

