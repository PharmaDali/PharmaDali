import { ActivityIndicator, StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@src/shared/theme/colorPalette'
import ActiveOrdersScreen from './ActiveOrdersScreen'
import CompletedOrdersScreen from './CompletedOrdersScreen'
import { useCustomerOrders } from './useCustomerOrders'

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState('active')
  const {
    loading,
    errorMessage,
    activeOrders,
    completedOrders,
    reloadOrders,
  } = useCustomerOrders()

  return (
    <ScrollView style={styles.container}>
      <View className="items-center">
        <View className="flex-row items-center justify-center mt-5 rounded-2xl shadow-xl px-8 py-2 bg-white elevation-2 border border-gray-200">
          <TouchableOpacity onPress={() => setActiveTab('active')} className="px-4">
            <Text className="text-lg" style={activeTab === 'active' ? styles.activeTabLabelBold : styles.inactiveTabLabelBold}>
              Active
            </Text>
            {activeTab === 'active' && <View className="mt-1 h-0.5" style={{ backgroundColor: colors.buttonColor }} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('completed')} className="px-4">
            <Text className="text-lg" style={activeTab === 'completed' ? styles.activeTabLabelBold : styles.inactiveTabLabelBold}>
              Completed
            </Text>
            {activeTab === 'completed' && <View className="mt-1 h-0.5" style={{ backgroundColor: colors.buttonColor }} />}
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color={colors.buttonColor} />
          <Text className="mt-3 text-xs text-gray-500" style={styles.helperText}>Loading your orders...</Text>
        </View>
      )}

      {!loading && !!errorMessage && (
        <View className="mx-4 mt-4 bg-[#FFF1F1] border border-[#FFD7D7] rounded-xl p-3">
          <Text className="text-xs text-[#B42318]" style={styles.helperText}>{errorMessage}</Text>
          <TouchableOpacity onPress={reloadOrders} className="mt-2 self-start px-3 py-1.5 bg-[#48AAD9] rounded-lg">
            <Text className="text-white text-xs" style={styles.tabLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !errorMessage && (
        activeTab === 'active'
          ? <ActiveOrdersScreen orders={activeOrders} />
          : <CompletedOrdersScreen orders={completedOrders} />
      )}
    </ScrollView>
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
