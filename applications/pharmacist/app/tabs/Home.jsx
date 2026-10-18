import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, Switch, Animated } from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import StatsIcon from '@assets/icons/pharmacist_home/stats_icon.svg'

import { colors } from '@src/shared/theme/colorPalette'
import { getPharmacyOrders } from '@shared/services/orderToPharmacistService'
import { getPharmacistProfile, updatePharmacistDutyStatus } from '@shared/services/pharmacistProfileService'
import { toTitleCase } from '@shared/utils/stringUtils'
import DutyStatusConfirmationOverlay from '@shared/components/DutyStatusConfirmationOverlay'

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

const SkeletonBlock = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#E2E8F0', opacity },
        style,
      ]}
    />
  );
};

const ShiftStatusBanner = ({ firstName, isOnDuty, isPharmacyOpen = false, profileLoaded = false, isUpdatingDuty, onToggleDuty }) => {
  const displayFirstName = firstName ? toTitleCase(firstName) : '';
  const effectiveOnDuty = profileLoaded && isPharmacyOpen && Boolean(isOnDuty);

  return (
    <View className="mx-4 mt-4 mb-0 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      {!profileLoaded ? (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-3">
            <SkeletonBlock width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <SkeletonBlock width={120} height={17} borderRadius={6} style={{ marginBottom: 7 }} />
              <SkeletonBlock width={145} height={13} borderRadius={6} />
            </View>
          </View>
          <SkeletonBlock width={46} height={26} borderRadius={13} />
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-3">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                effectiveOnDuty ? 'bg-[#E8F8FF]' : 'bg-slate-100'
              }`}
            >
              <MaterialCommunityIcons
                name={effectiveOnDuty ? 'account-check-outline' : 'account-clock-outline'}
                size={22}
                color={effectiveOnDuty ? '#48AAD9' : '#64748B'}
              />
            </View>
            <View className="flex-1">
              {Boolean(displayFirstName) && (
                <Text style={styles.titleText} numberOfLines={1}>
                  Hi, {displayFirstName}!
                </Text>
              )}
              <View className="flex-row items-center mt-0.5">
                <View
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    effectiveOnDuty ? 'bg-[#48AAD9]' : 'bg-slate-400'
                  }`}
                />
                <Text
                  className={`text-xs ${
                    effectiveOnDuty ? 'text-[#48AAD9]' : 'text-slate-500'
                  }`}
                  style={{ fontFamily: 'Poppins-SemiBold', includeFontPadding: false }}
                >
                  {effectiveOnDuty ? 'In Duty' : 'Out of Duty'}
                </Text>
                <Text
                  className="text-slate-400 text-[11px] ml-1.5"
                  style={{ fontFamily: 'Poppins-Regular', includeFontPadding: false }}
                >
                  {!isPharmacyOpen
                    ? '• Store closed'
                    : effectiveOnDuty
                    ? '• Active shift'
                    : '• Shift paused'}
                </Text>
              </View>
            </View>
          </View>

          <Switch
            value={effectiveOnDuty}
            onValueChange={onToggleDuty}
            disabled={isUpdatingDuty || !isPharmacyOpen}
            trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
            thumbColor={effectiveOnDuty ? '#48AAD9' : '#94A3B8'}
          />
        </View>
      )}
    </View>
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

const getCustomerNote = (note) => {
  if (!note || typeof note !== 'string') return null;
  const parts = note.split('|').map((p) => p.trim());
  const customerParts = parts.filter(
    (p) => !p.match(/^(payment receipt rejected|customer acknowledged payment issue|pos walk-in sale)/i)
  );
  const clean = customerParts.join(' | ').trim();
  return clean || null;
};

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
        const customerNote = getCustomerNote(order?.note);
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

            {Boolean(customerNote) && (
              <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons name="note-text-outline" size={13} color="#0284C7" style={{ marginRight: 4 }} />
                <Text className="text-sky-700 text-[11px] flex-1" numberOfLines={1} style={{ fontFamily: 'Poppins-Regular' }}>
                  Note: {customerNote}
                </Text>
              </View>
            )}

            <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-slate-50">
              <Text className="text-slate-500 text-[11px]" style={{ fontFamily: 'Poppins-Regular' }}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} • PHP {total}
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
  const [firstName, setFirstName] = useState('');
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [isPharmacyOpen, setIsPharmacyOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isUpdatingDuty, setIsUpdatingDuty] = useState(false);
  const [pendingDutyValue, setPendingDutyValue] = useState(null);

  const loadPharmacistStatus = useCallback(async () => {
    try {
      const response = await getPharmacistProfile();
      const profileData = response?.data ?? null;
      if (profileData) {
        const storeOpen = Boolean(profileData?.is_pharmacy_open ?? profileData?.pharmacy?.is_open ?? true);
        setFirstName(profileData?.user?.first_name ?? '');
        setIsPharmacyOpen(storeOpen);
        setIsOnDuty(storeOpen && Boolean(profileData?.is_on_duty ?? true));
        setProfileLoaded(true);
      }
    } catch {
      // Keep existing state on transient error
    }
  }, []);

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
    loadPharmacistStatus();
  }, [loadDashboardData, loadPharmacistStatus]);

  useFocusEffect(
    useCallback(() => {
      loadPharmacistStatus();
    }, [loadPharmacistStatus])
  );

  const handleToggleDuty = (nextValue) => {
    if (!isPharmacyOpen && nextValue) {
      setIsOnDuty(false);
      return;
    }
    setPendingDutyValue(Boolean(nextValue));
  };

  const handleConfirmDutyToggle = async () => {
    if (pendingDutyValue === null) return;
    const nextValue = Boolean(pendingDutyValue);
    if (!isPharmacyOpen && nextValue) {
      setIsOnDuty(false);
      setPendingDutyValue(null);
      return;
    }
    const previousValue = isOnDuty;
    setIsUpdatingDuty(true);
    try {
      const res = await updatePharmacistDutyStatus(nextValue);
      if (res?.data) {
        const storeOpen = Boolean(res.data.is_pharmacy_open ?? res.data.pharmacy?.is_open ?? isPharmacyOpen);
        setIsPharmacyOpen(storeOpen);
        setIsOnDuty(storeOpen && Boolean(res.data.is_on_duty));
      } else {
        setIsOnDuty(nextValue);
      }
      setPendingDutyValue(null);
    } catch {
      setIsOnDuty(isPharmacyOpen ? previousValue : false);
      setPendingDutyValue(null);
    } finally {
      setIsUpdatingDuty(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadDashboardData(), loadPharmacistStatus()]);
    setRefreshing(false);
  }, [loadDashboardData, loadPharmacistStatus]);

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.buttonColor]}
          tintColor={colors.buttonColor}
        />
      }
    >
      <ShiftStatusBanner
        firstName={firstName}
        isOnDuty={isOnDuty}
        isPharmacyOpen={isPharmacyOpen}
        profileLoaded={profileLoaded}
        isUpdatingDuty={isUpdatingDuty}
        onToggleDuty={handleToggleDuty}
      />

      <QuickStats
        pendingCount={pendingCount}
        completedTodayCount={completedTodayCount}
      />

      <QuickShortcuts counts={actionCounts} onNavigate={(path) => router.push(path)} />

      <RecentOrdersFeed
        orders={recentOrders}
        onNavigate={(path) => router.push(path)}
      />

      <DutyStatusConfirmationOverlay
        visible={pendingDutyValue !== null}
        targetDutyStatus={Boolean(pendingDutyValue)}
        loading={isUpdatingDuty}
        onClose={() => {
          if (!isUpdatingDuty) setPendingDutyValue(null);
        }}
        onConfirm={handleConfirmDutyToggle}
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
