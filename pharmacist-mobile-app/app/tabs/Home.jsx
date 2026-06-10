import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import StatsIcon from '@assets/icons/pharmacist_home/stats_icon.svg'
import DemandAlertIcon from '@assets/icons/pharmacist_home/demand_alert_icon.svg'

import { colors } from '@src/shared/theme/colorPalette'
import { getBranchOrders } from '@shared/services/orderToPharmacistService'
import { getDemandForecasts } from '@shared/services/forecastService'

const FALLBACK_TRENDING = [
  { name: 'Biogesic', generic: 'Paracetamol' },
  { name: 'Solmux', generic: 'Carbocisteine' },
]

const stripProductName = (raw) => {
  let text = String(raw || '');
  text = text.replace(/^[0-9]+[_-]+/, '');
  text = text.replace(/[._-]+/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text || 'Unknown item';
}

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

const DemandAlert = ({ items, loading, error, onLoadMore, onLoadLess, canLoadMore, canLoadLess }) => (
  <View className="mx-4 my-2 mb-4 bg-white rounded-lg p-4 shadow-lg">
    <View className="flex-row items-center mb-1">
      <DemandAlertIcon width={22} height={22} />
      <Text className="ms-2" style={styles.titleText}>AI Demand Alert</Text>
    </View>
    <Text style={styles.subtitleText}>Trending Medicines</Text>

    {loading && (
      <Text className="text-xs mt-3" style={styles.subtitleText}>Loading demand alerts...</Text>
    )}

    {!!error && !loading && (
      <Text className="text-xs mt-3" style={styles.errorText}>{error}</Text>
    )}

    {!loading && !error && items.length === 0 && (
      <Text className="text-xs mt-3" style={styles.subtitleText}>No demand alerts available.</Text>
    )}

    {!loading && !error && items.map((med, i) => (
      <View key={`${med.name}-${i}`} className="flex-row items-center bg-[#F5F9FF] rounded-lg p-3 mt-2">
        <View>
          <Text style={styles.medNameText}>{med.name}</Text>
          <Text style={styles.medGenericText}>({med.generic})</Text>
        </View>
      </View>
    ))}

    {!loading && !error && (canLoadMore || canLoadLess) && (
      <View className="flex-row justify-center gap-3 mt-3">
        {canLoadMore && (
          <TouchableOpacity
            className="px-4 py-2 rounded-lg border"
            style={styles.loadMoreButton}
            onPress={onLoadMore}
          >
            <Text style={styles.loadMoreText}>View All</Text>
          </TouchableOpacity>
        )}
        {canLoadLess && (
          <TouchableOpacity
            className="px-4 py-2 rounded-lg border"
            style={styles.loadMoreButton}
            onPress={onLoadLess}
          >
            <Text style={styles.loadMoreText}>View Less</Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
)

const Home = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [alertItems, setAlertItems] = useState([]);
  const [alertVisibleCount, setAlertVisibleCount] = useState(3);
  const [alertLoading, setAlertLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertError, setAlertError] = useState('');

  const alertVisibleItems = useMemo(
    () => alertItems.slice(0, alertVisibleCount),
    [alertItems, alertVisibleCount]
  );
  const canLoadMoreAlerts = alertVisibleCount < alertItems.length;
  const canLoadLessAlerts = alertVisibleCount > 3 && alertItems.length > 3;

  const loadQuickStats = useCallback(async () => {
    try {
      const data = await getBranchOrders();
      const orders = Array.isArray(data) ? data : [];
      const pendingStatuses = new Set(['pending', 'reviewing', 'preparing', 'ready_for_pickup']);
      const completedStatuses = new Set(['completed']);

      const pending = orders.filter((order) =>
        pendingStatuses.has(String(order?.status || '').toLowerCase())
      ).length;
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

  const loadDemandAlerts = useCallback(async (showLoading = true) => {
    if (showLoading) setAlertLoading(true);
    setAlertError('');

    try {
      const data = await getDemandForecasts({ granularity: 'weekly', period: 'current', limit: 10 });
      const sorted = (Array.isArray(data) ? data : [])
        .slice()
        .sort((a, b) => Number(b?.forecast_value ?? 0) - Number(a?.forecast_value ?? 0))
        .slice(0, 10);
      const mapped = sorted.map((entry) => {
        const forecastValue = Number(entry?.forecast_value ?? 0);
        const name = stripProductName(entry?.unique_id);
        return {
          name,
          generic: `Forecast: ${Number.isFinite(forecastValue) ? forecastValue.toFixed(0) : 'N/A'}`,
        };
      });

      setAlertItems(mapped);
      setAlertVisibleCount(3);
    } catch (error) {
      setAlertItems(FALLBACK_TRENDING);
      setAlertVisibleCount(3);
      setAlertError(error?.message || 'Unable to load demand alerts.');
    } finally {
      if (showLoading) setAlertLoading(false);
    }
  }, []);

  const loadAll = useCallback(async (showLoading = true) => {
    await Promise.all([
      loadQuickStats(),
      loadDemandAlerts(showLoading)
    ]);
  }, [loadQuickStats, loadDemandAlerts]);

  useEffect(() => {
    loadAll(true);
  }, [loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll(false);
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
      <DemandAlert
        items={alertVisibleItems}
        loading={alertLoading}
        error={alertError}
        onLoadMore={() => setAlertVisibleCount(alertItems.length)}
        onLoadLess={() => setAlertVisibleCount(3)}
        canLoadMore={canLoadMoreAlerts}
        canLoadLess={canLoadLessAlerts}
      />
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
  subtitleText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#888',
    marginTop: 2,
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
  medNameText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textColor,
  },
  medGenericText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#888',
  },
  loadMoreButton: {
    borderColor: '#89C5E5',
    backgroundColor: '#EEF8FD',
  },
  loadMoreText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#CC3A3A',
  },
})
