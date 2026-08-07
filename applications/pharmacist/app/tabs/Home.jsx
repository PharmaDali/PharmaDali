import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import StatsIcon from '@assets/icons/pharmacist_home/stats_icon.svg'

import { colors } from '@src/shared/theme/colorPalette'
import { getPharmacyOrders } from '@shared/services/orderToPharmacistService'

const isSameDay = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const QuickStats = ({ pendingCount, completedTodayCount, readyCount }) => (
  <View className="m-4 mb-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
    <View className="flex-row items-center p-1 pb-2">
      <StatsIcon width={22} height={22} />
      <Text className="ms-2" style={styles.titleText}>
        Quick Stats
      </Text>
    </View>
    <View className="mt-3 flex-row flex-wrap gap-2.5">
      <View className="flex-row bg-[#E8F8FF] p-3.5 rounded-xl items-center flex-1 min-w-[130px]">
        <Text style={styles.pendingCountText}>{pendingCount}</Text>
        <Text className="ms-2.5 flex-1 text-slate-700 text-xs" style={{ fontFamily: 'Poppins-Medium' }}>
          Pending Orders
        </Text>
      </View>
      <View className="flex-row bg-[#D7FAE4] p-3.5 rounded-xl items-center flex-1 min-w-[130px]">
        <Text style={styles.completedCountText}>{completedTodayCount}</Text>
        <View className="ms-2.5 flex-1">
          <Text className="text-slate-700 text-xs" style={{ fontFamily: 'Poppins-Medium' }}>
            Completed
          </Text>
          <Text className="text-[10px] text-emerald-700 font-semibold" style={{ fontFamily: 'Poppins-Bold' }}>
            Today Only
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const QuickShortcuts = ({ counts, onNavigate }) => (
  <View className="mx-4 my-2">
    <Text className="text-slate-600 text-sm mb-2.5 px-1" style={{ fontFamily: 'Poppins-SemiBold' }}>
      Quick Actions
    </Text>
    <View className="flex-row gap-2.5">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onNavigate({ pathname: '/tabs/orders/Orders', params: { tab: 'For Review' } })}
        className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm items-center justify-center relative"
      >
        <View className="w-10 h-10 rounded-full bg-sky-50 items-center justify-center mb-1.5 relative">
          <MaterialCommunityIcons name="clipboard-text-clock-outline" size={22} color="#48AAD9" />
          {counts?.forReview > 0 && (
            <View className="absolute -top-1 -right-1 bg-sky-500 rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
              <Text className="text-white text-[10px]" style={{ fontFamily: 'Poppins-Bold' }}>
                {counts.forReview > 99 ? '99+' : counts.forReview}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-slate-600 text-xs text-center" style={{ fontFamily: 'Poppins-Medium' }}>
          For Review
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onNavigate({ pathname: '/tabs/orders/Orders', params: { tab: 'Preparing' } })}
        className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm items-center justify-center relative"
      >
        <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mb-1.5 relative">
          <MaterialCommunityIcons name="package-variant-closed" size={22} color="#D97706" />
          {counts?.preparing > 0 && (
            <View className="absolute -top-1 -right-1 bg-amber-500 rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
              <Text className="text-white text-[10px]" style={{ fontFamily: 'Poppins-Bold' }}>
                {counts.preparing > 99 ? '99+' : counts.preparing}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-slate-600 text-xs text-center" style={{ fontFamily: 'Poppins-Medium' }}>
          Preparing
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onNavigate('/tabs/ready/Ready')}
        className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm items-center justify-center relative"
      >
        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-1.5 relative">
          <MaterialCommunityIcons name="store-check-outline" size={22} color="#059669" />
          {counts?.ready > 0 && (
            <View className="absolute -top-1 -right-1 bg-emerald-500 rounded-full px-1.5 py-0.5 min-w-[18px] items-center justify-center">
              <Text className="text-white text-[10px]" style={{ fontFamily: 'Poppins-Bold' }}>
                {counts.ready > 99 ? '99+' : counts.ready}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-slate-600 text-xs text-center" style={{ fontFamily: 'Poppins-Medium' }}>
          For Pickup
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const RecentOrdersFeed = ({ orders, onNavigate }) => (
  <View className="mx-4 my-3 mb-6">
    <View className="flex-row items-center justify-between mb-2.5 px-1">
      <Text className="text-slate-600 text-sm" style={{ fontFamily: 'Poppins-SemiBold' }}>
        Recent Pending Orders
      </Text>
      <TouchableOpacity onPress={() => onNavigate('/tabs/orders/Orders')}>
        <Text className="text-sky-600 text-xs" style={{ fontFamily: 'Poppins-SemiBold' }}>
          View All
        </Text>
      </TouchableOpacity>
    </View>

    {orders.length === 0 ? (
      <View className="bg-white p-6 rounded-2xl border border-slate-100 items-center justify-center">
        <MaterialCommunityIcons name="check-circle-outline" size={32} color="#94A3B8" />
        <Text className="text-slate-500 text-xs mt-2" style={{ fontFamily: 'Poppins-Medium' }}>
          No pending orders right now
        </Text>
      </View>
    ) : (
      orders.map((order) => {
        const customer = order?.customer?.user;
        const customerName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Customer';
        const status = String(order?.status || '').toLowerCase();
        const itemCount = Array.isArray(order?.items) ? order.items.length : 0;
        const total = Number(order?.total_amount ?? 0).toFixed(2);

        return (
          <TouchableOpacity
            key={order.id}
            activeOpacity={0.8}
            onPress={() =>
              onNavigate(
                status === 'preparing'
                  ? { pathname: '/tabs/orders/Orders', params: { tab: 'Preparing' } }
                  : { pathname: '/tabs/orders/Orders', params: { tab: 'For Review' } }
              )
            }
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-3"
          >
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-slate-600 text-xs" style={{ fontFamily: 'Poppins-SemiBold' }}>
                #{order.order_number || order.id}
              </Text>
              <View
                className={`px-2.5 py-0.5 rounded-full ${
                  status === 'preparing'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-sky-50 border border-sky-200'
                }`}
              >
                <Text
                  className={`text-[11px] ${
                    status === 'preparing' ? 'text-amber-700' : 'text-sky-700'
                  }`}
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  {status === 'preparing' ? 'Preparing' : 'For Review'}
                </Text>
              </View>
            </View>

            <Text className="text-slate-500 text-xs mb-1" style={{ fontFamily: 'Poppins-Medium' }}>
              Customer: {customerName}
            </Text>

            <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-slate-50">
              <Text className="text-slate-500 text-[11px]" style={{ fontFamily: 'Poppins-Regular' }}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} • ₱{total}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-sky-600 text-xs mr-1" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Review Order
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#0284C7" />
              </View>
            </View>
          </TouchableOpacity>
        );
      })
    )}
  </View>
);

const Home = () => {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [completedTodayCount, setCompletedTodayCount] = useState(0);
  const [actionCounts, setActionCounts] = useState({ forReview: 0, preparing: 0, ready: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const res = await getPharmacyOrders();
      const orders = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
      
      const forReview = orders.filter((o) => ['pending', 'reviewing'].includes(String(o?.status || '').toLowerCase()));
      const preparing = orders.filter((o) => String(o?.status || '').toLowerCase() === 'preparing');
      const ready = orders.filter((o) => String(o?.status || '').toLowerCase() === 'ready_for_pickup');
      const pending = [...forReview, ...preparing];

      // Filter completed orders strictly completed TODAY (current calendar day)
      const completedToday = orders.filter((order) => {
        const isCompleted = String(order?.status || '').toLowerCase() === 'completed';
        const completedDate = order?.completed_at || order?.updated_at || order?.created_at;
        return isCompleted && isSameDay(completedDate);
      });

      setPendingCount(pending.length);
      setCompletedTodayCount(completedToday.length);
      setActionCounts({
        forReview: forReview.length,
        preparing: preparing.length,
        ready: ready.length,
      });
      setRecentOrders(pending.slice(0, 3));
    } catch {
      setPendingCount(0);
      setCompletedTodayCount(0);
      setActionCounts({ forReview: 0, preparing: 0, ready: 0 });
      setRecentOrders([]);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.buttonColor]}
          tintColor={colors.buttonColor}
        />
      }
    >
      <QuickStats
        pendingCount={pendingCount}
        completedTodayCount={completedTodayCount}
      />

      <QuickShortcuts counts={actionCounts} onNavigate={(path) => router.push(path)} />

      <RecentOrdersFeed
        orders={recentOrders}
        onNavigate={(path) => router.push(path)}
      />
    </ScrollView>
  );
};

export default Home;

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
});
