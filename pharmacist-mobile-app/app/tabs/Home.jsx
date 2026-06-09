import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { LineChart } from 'react-native-gifted-charts'
import StatsIcon from '@assets/icons/pharmacist_home/stats_icon.svg'
import ForecastIcon from '@assets/icons/pharmacist_home/forecast_icon.svg'
import DemandAlertIcon from '@assets/icons/pharmacist_home/demand_alert_icon.svg'
import BiogesicImg from '@assets/images/biogesic_img.png'
import SolmuxImg from '@assets/images/solmux_img.png'
import BetadineImg from '@assets/images/betadine_img.png'
import BandaidImg from '@assets/images/bandaid_img.png'
import RecitImg from '@assets/images/recit_dummy.png'
import { colors } from '@src/shared/theme/colorPalette'
import { formatDateToMMDDYYYY } from '@shared/utils/dateUtils'
import { getBranchOrders } from '@shared/services/orderToPharmacistService'
import { getDemandForecasts } from '@shared/services/forecastService'

const FALLBACK_TRENDING = [
  { name: 'Biogesic', generic: 'Paracetamol', image: BiogesicImg },
  { name: 'Solmux', generic: 'Carbocisteine', image: SolmuxImg },
]

const DEMAND_IMAGE_MAP = [
  { key: 'biogesic', image: BiogesicImg },
  { key: 'solmux', image: SolmuxImg },
]


const stripProductName = (raw) => {
  let text = String(raw || '');
  text = text.replace(/^[0-9]+[_-]+/, '');
  text = text.replace(/[._-]+/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  return text || 'Unknown item';
}

const getImageForDemandName = (name) => {
  const normalized = String(name || '').toLowerCase();
  const match = DEMAND_IMAGE_MAP.find((entry) => normalized.includes(entry.key));
  if (match) {
    return match.image;
  }

  return null;
}

const DemandFallbackImage = ({ name }) => {
  const initial = String(name || '').trim().charAt(0).toUpperCase() || 'M';

  return (
    <View className="w-12 h-12 rounded items-center justify-center mr-3" style={styles.fallbackImage}>
      <Text style={styles.fallbackImageText}>{initial}</Text>
    </View>
  );
}

const CHART_DATA = [
  { value: 15, label: '9 AM' },
  { value: 20, label: '12 PM' },
  { value: 30, label: '3 PM' },
  { value: 35, label: '6 PM' },
  { value: 25, label: '6 PM' },
  { value: 20, label: '' },
]

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

const DemandForecast = () => (
  <View className="mx-4 my-2 bg-white rounded-lg p-4 shadow-lg">
    <View className="flex-row items-center mb-1">
      <ForecastIcon width={22} height={22} />
      <Text className="ms-2" style={styles.titleText}>AI Demand Forecast</Text>
    </View>
    <Text style={styles.subtitleText}>{formatDateToMMDDYYYY('2026-02-06')} ▾</Text>

    <View className="mt-3 mb-2">
      <LineChart
        data={CHART_DATA}
        width={250}
        height={120}
        maxValue={40}
        noOfSections={3}
        spacing={44}
        initialSpacing={10}
        color="#48AAD9"
        thickness={2}
        dataPointsColor="#48AAD9"
        dataPointsRadius={5}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        yAxisColor="transparent"
        xAxisColor="#eee"
        rulesColor="#eee"
        curved
        areaChart
        startFillColor="rgba(72, 170, 217, 0.15)"
        endFillColor="rgba(72, 170, 217, 0.01)"
        startOpacity={0.3}
        endOpacity={0}
        highlightedRange={{
          from: 25,
          to: 40,
          color: 'rgba(253, 216, 53, 0.2)',
        }}
      />
    </View>

    <View className="flex-row justify-between mt-2">
      <View>
        <View className="flex-row items-center mb-1">
          <View className="w-3 h-3 rounded-full bg-[#FDD835] mr-2" />
          <Text style={styles.legendText}>High Demand</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#66BB6A] mr-2" />
          <Text style={styles.legendText}>Low Demand</Text>
        </View>
      </View>
      <View className="items-end">
        <Text style={styles.statValueText}>125 orders</Text>
        <Text style={styles.predictionText}>Today's Prediction: 185 orders</Text>
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

    {!loading && !error && items.map((med, i) => {
      const imageSource = typeof med.image === 'string'
        ? { uri: med.image }
        : med.image;

      return (
      <View key={`${med.name}-${i}`} className="flex-row items-center bg-[#F5F9FF] rounded-lg p-3 mt-2">
        {imageSource ? (
          <View className="w-12 h-12 bg-white rounded items-center justify-center mr-3">
            <Image source={imageSource} className="w-12 h-12" resizeMode="contain" />
          </View>
        ) : (
          <DemandFallbackImage name={med.name} />
        )}
        <View>
          <Text style={styles.medNameText}>{med.name}</Text>
          <Text style={styles.medGenericText}>({med.generic})</Text>
        </View>
      </View>
      );
    })}

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
          image: getImageForDemandName(name),
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
      <DemandForecast />
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
  axisText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    color: '#aaa',
  },
  legendText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: colors.textColor,
  },
  statValueText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.textColor,
  },
  predictionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#888',
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
  fallbackImage: {
    backgroundColor: '#EAF4FB',
    borderWidth: 1,
    borderColor: '#CFE6F4',
  },
  fallbackImageText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#CC3A3A',
  },
})

