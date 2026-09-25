import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { colors } from '@src/shared/theme/colorPalette'
import ActiveOrdersScreen from './ActiveOrdersScreen'
import CompletedOrdersScreen from './CompletedOrdersScreen'
import { useCustomerOrders } from './useCustomerOrders'
import { useOrderSubmission } from '@shared/context/OrderSubmissionContext'
import SkeletonOrders from '@shared/components/SkeletonOrders'

export default function OrdersScreen() {
  const { tab } = useLocalSearchParams()
  const [activeTab, setActiveTab] = useState(tab === 'completed' ? 'completed' : 'active')
  const [refreshing, setRefreshing] = useState(false)
  const { optimisticOrders } = useOrderSubmission()
  const {
    loading,
    errorMessage,
    activeOrders,
    completedOrders,
    reloadOrders,
  } = useCustomerOrders()

  useEffect(() => {
    if (tab === 'completed') {
      setActiveTab('completed')
    }
  }, [tab])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await reloadOrders()
    setRefreshing(false)
  }, [reloadOrders])

  const hasAnyOrders = activeOrders.length > 0 || completedOrders.length > 0 || (optimisticOrders && optimisticOrders.length > 0)
  const showSkeleton = loading && !hasAnyOrders

  return (
    <View style={styles.container}>
      <View className="items-center">
        <View style={{ height: 40 }} className="flex-row items-center justify-center mt-4 rounded-xl px-6 bg-white shadow-sm border border-gray-200">
          <TouchableOpacity onPress={() => setActiveTab('active')} className="px-4 h-full justify-center items-center">
            <Text className="text-sm" style={activeTab === 'active' ? styles.activeTabLabelBold : styles.inactiveTabLabelBold}>
              Active
            </Text>
            {activeTab === 'active' && <View className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full" style={{ backgroundColor: colors.buttonColor }} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('completed')} className="px-4 h-full justify-center items-center">
            <Text className="text-sm" style={activeTab === 'completed' ? styles.activeTabLabelBold : styles.inactiveTabLabelBold}>
              Completed
            </Text>
            {activeTab === 'completed' && <View className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full" style={{ backgroundColor: colors.buttonColor }} />}
          </TouchableOpacity>
        </View>
      </View>

      {showSkeleton && (
        <SkeletonOrders />
      )}

      {!showSkeleton && !!errorMessage && !hasAnyOrders && (
        <View className="mx-4 mt-4 bg-[#FFF1F1] border border-[#FFD7D7] rounded-xl p-3">
          <Text className="text-xs text-[#B42318]" style={styles.helperText}>{errorMessage}</Text>
          <TouchableOpacity onPress={reloadOrders} className="mt-2 self-start px-3 py-1.5 bg-[#48AAD9] rounded-lg">
            <Text className="text-white text-xs" style={styles.tabLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!showSkeleton && (hasAnyOrders || !errorMessage) && (
        activeTab === 'active'
          ? <ActiveOrdersScreen orders={activeOrders} onOrderCancelled={reloadOrders} refreshing={refreshing} onRefresh={onRefresh} />
          : <CompletedOrdersScreen orders={completedOrders} refreshing={refreshing} onRefresh={onRefresh} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  activeTabLabelBold: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  tabLabel: {
    fontFamily: 'Poppins-SemiBold',
  },
  inactiveTabLabelBold: {
    fontFamily: 'Poppins-SemiBold',
    color: '#999',
  },
  helperText: {
    fontFamily: 'Poppins-Medium',
  },
})
