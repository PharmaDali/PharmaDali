import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@shared/colorPallete';
import ActiveOrders from './ActiveOrders';
import CompletedOrders from './CompletedOrders';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <ScrollView style={styles.container}>
      <View className="items-center">
        <View className="flex-row items-center justify-center mt-5 rounded-2xl shadow-xl px-8 py-2 bg-white elevation-2 border border-gray-200">
          <TouchableOpacity onPress={() => setActiveTab('active')} className="px-4">
            <Text className="text-lg font-semibold" style={activeTab === 'active' ? styles.activeTabLabel : styles.inactiveTabLabel}>
              Active
            </Text>
            {activeTab === 'active' && <View className="mt-1 h-0.5" style={{ backgroundColor: colors.buttonColor }} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('completed')} className="px-4">
            <Text className="text-lg font-semibold" style={activeTab === 'completed' ? styles.activeTabLabel : styles.inactiveTabLabel}>
              Completed
            </Text>
            {activeTab === 'completed' && <View className="mt-1 h-0.5" style={{ backgroundColor: colors.buttonColor }} />}
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'active' ? <ActiveOrders /> : <CompletedOrders />}
    </ScrollView>
  )
}

export default Orders

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  activeTabLabel: {
    color: colors.buttonColor,
  },
  inactiveTabLabel: {
    color: '#999',
  },
})