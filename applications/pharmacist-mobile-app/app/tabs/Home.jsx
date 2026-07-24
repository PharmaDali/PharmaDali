import { StyleSheet, Text, View, ScrollView, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import StatsIcon from '@assets/icons/pharmacist_home/stats_icon.svg'

import { colors } from '@src/shared/theme/colorPalette'
import { getPharmacyOrders } from '@shared/services/orderToPharmacistService'

const QuickStats = ({ pendingCount, completedCount }) => (
  <View className="m-4 mb-2 bg-white rounded-lg p-4 shadow-lg">
    <View className="flex-row items-start p-2 pb-0">
      <StatsIcon width={22} height={22} />
      <Text className="ms-2" style={styles.titleText}>
        Quick Stats
      </Text>
    </View>
    <View className="mt-4 flex-row flex-wrap gap-3">
      <View className="flex-row bg-[#E8F8FF] p-4 rounded-lg items-center flex-1 min-w-[140px]">
        <Text style={styles.pendingCountText}>{pendingCount}</Text>
        <Text className="ms-2 flex-1" style={styles.statsLabelText}>Pending Orders</Text>
      </View>
      <View className="flex-row bg-[#D7FAE4] p-4 rounded-lg items-center flex-1 min-w-[140px]">
        <Text style={styles.completedCountText}>{completedCount}</Text>
        <Text className="ms-2 flex-1" style={styles.statsLabelText}>Completed Orders</Text>
      </View>
    </View>
  </View>
)

const Home = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuickStats = useCallback(async () => {
    try {
      const res = await getPharmacyOrders();
      const orders = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
      const pendingStatuses = new Set(['pending', 'reviewing', 'preparing', 'ready_for_pickup']);
      const completedStatuses = new Set(['completed']);

      const pending = orders.filter((order) => {
        const status = String(order?.status || '').toLowerCase();
        return pendingStatuses.has(status) && status !== 'overdue' && status !== 'expired';
      }).length;
      const completed = orders.filter((order) =>
        completedStatuses.has(String(order?.status || '').toLowerCase())
      ).length;

      setPendingCount(pending);
      setCompletedCount(completed);
    } catch {
      setPendingCount(0);
      setCompletedCount(0);
    }
  }, []);

  const loadAll = useCallback(async () => {
    await loadQuickStats();
  }, [loadQuickStats]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.buttonColor}
        />
      }
    >
      <QuickStats pendingCount={pendingCount} completedCount={completedCount} />
    </ScrollView>
  )
}

export default Home

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.textColor,
  },
  pendingCountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: colors.buttonColor,
  },
  completedCountText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#60B17E',
  },
  statsLabelText: {
    flexShrink: 1,
  },
})
