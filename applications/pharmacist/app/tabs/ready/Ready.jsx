import { FlatList, View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { colors } from '@shared/theme/colorPalette';
import { Tabs, ReadyOrderCard } from '@components/pharmacist-orders-and-ready-components';
import BetadineImg from '@assets/images/betadine_img.png';
import MaleIcon from '@assets/icons/person-icons/male_icon.svg';
import { formatDateToMMDDYYYY } from '@shared/utils/dateUtils';
import { getPharmacyOrders } from '@shared/services/orderToPharmacistService';

const readyTabs = ['For Pickup', 'Completed', 'Expired'];

const tabApiMap = {
  'For Pickup': 'for_pickup',
  'Completed':  'completed',
  'Expired':    'expired',
};

const mapApiStatusToTabStatus = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'ready_for_pickup') return 'For Pickup';
  if (s === 'completed') return 'Completed';
  if (s === 'overdue') return 'Expired';
  return null;
};

const mapApiOrdersToUiOrders = (apiOrders) => {
  if (!Array.isArray(apiOrders)) return [];

  return apiOrders.map((order) => {
    const customer = order?.customer?.user;
    const baseUrl = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');

    return {
      id: order.id,
      orderNumber: order.order_number || String(order.id),
      customerName: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Customer',
      customerAvatar: MaleIcon,
      pickupTime: formatDateToMMDDYYYY(order?.scheduled_pickup_at) || 'Schedule not set',
      submittedAgo: formatDateToMMDDYYYY(order?.created_at) || 'Recently',
      orderTotal: Number(order?.total_amount ?? 0).toFixed(2),
      status: mapApiStatusToTabStatus(order?.status),
      items: (order?.items || []).map((item) => {
        const product = item?.pharmacy_product?.product;
        const categoryName = item?.pharmacy_product?.category?.category_name || '';
        const prescription = item?.order_item_prescription;
        const prescriptionRequired = Boolean(product?.is_prescribed);
        const hasPrescriptionImage = Boolean(prescription?.prescription_image_path);
        const baseName = item?.product_name
          || product?.product_name
          || product?.brand_name
          || product?.generic_name
          || 'Medicine item';
        const strengthForm = [product?.strength, product?.form, product?.size].filter(Boolean).join(' ');
        const description = strengthForm ? `${baseName} (${strengthForm})` : baseName;

        return {
          img: BetadineImg,
          product,
          categoryName,
          description,
          price: Number(item?.unit_price_snapshot ?? 0).toFixed(2),
          quantity: item?.quantity ?? 0,
          sizeLabel: product?.size ? 'Size' : (product?.strength ? 'Dosage' : 'Size'),
          size: product?.size || product?.strength || '-',
          prescriptionRequired,
          prescriptionImage: hasPrescriptionImage ? { uri: `${baseUrl}/storage/${prescription.prescription_image_path}` } : null,
        };
      }),
    };
  }).filter(order => order.status !== null);
};

const Ready = () => {
  const [activeTab, setActiveTab] = useState('For Pickup');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Per-Tab State for Lazy Loading & Infinite Scrolling
  const [tabStates, setTabStates] = useState({
    'For Pickup': { items: [], page: 1, hasMore: true, loaded: false, loading: false, loadingMore: false, total: 0 },
    'Completed':  { items: [], page: 1, hasMore: true, loaded: false, loading: false, loadingMore: false, total: 0 },
    'Expired':    { items: [], page: 1, hasMore: true, loaded: false, loading: false, loadingMore: false, total: 0 },
  });

  // Fetch orders for a specific tab with pagination
  const fetchTabOrders = useCallback(async (tabName, pageNumber = 1, isPullToRefresh = false) => {
    const apiTab = tabApiMap[tabName];
    if (!apiTab) return;

    setError('');
    setTabStates((prev) => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        loading: pageNumber === 1 && !isPullToRefresh,
        loadingMore: pageNumber > 1,
      },
    }));

    try {
      const res = await getPharmacyOrders({
        tab: apiTab,
        page: pageNumber,
        perPage: 10,
      });

      const mappedNewItems = mapApiOrdersToUiOrders(res.items || []);

      setTabStates((prev) => {
        const currentTab = prev[tabName];
        let updatedItems;

        if (pageNumber === 1) {
          updatedItems = mappedNewItems;
        } else {
          // Append and filter out duplicate IDs
          const existingIds = new Set(currentTab.items.map((item) => item.id));
          const uniqueNewItems = mappedNewItems.filter((item) => !existingIds.has(item.id));
          updatedItems = [...currentTab.items, ...uniqueNewItems];
        }

        return {
          ...prev,
          [tabName]: {
            items: updatedItems,
            page: pageNumber,
            hasMore: res.hasMore,
            loaded: true,
            loading: false,
            loadingMore: false,
            total: res.total || updatedItems.length,
          },
        };
      });
    } catch (e) {
      setError(e?.message || 'Failed to load orders.');
      setTabStates((prev) => ({
        ...prev,
        [tabName]: {
          ...prev[tabName],
          loading: false,
          loadingMore: false,
        },
      }));
    }
  }, []);

  // Lazy Loading: Fetch tab data only when tab becomes active for the first time
  useEffect(() => {
    if (!tabStates[activeTab]?.loaded && !tabStates[activeTab]?.loading) {
      fetchTabOrders(activeTab, 1);
    }
  }, [activeTab, fetchTabOrders, tabStates]);

  // Pull to refresh active tab
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTabOrders(activeTab, 1, true);
    setRefreshing(false);
  }, [activeTab, fetchTabOrders]);

  // Infinite scroll trigger for active tab
  const handleLoadMore = () => {
    const currentState = tabStates[activeTab];
    if (currentState && !currentState.loading && !currentState.loadingMore && currentState.hasMore) {
      fetchTabOrders(activeTab, currentState.page + 1);
    }
  };

  const currentTabState = tabStates[activeTab] || { items: [], loading: false, loadingMore: false, total: 0 };
  const filteredOrders = currentTabState.items;

  const counts = {
    'For Pickup': tabStates['For Pickup'].total,
    'Completed':  tabStates['Completed'].total,
    'Expired':    tabStates['Expired'].total,
  };

  const emptyMessage = activeTab === 'For Pickup'
    ? 'No orders are ready for pickup today.'
    : activeTab === 'Completed'
      ? 'No completed pickups today.'
      : 'No expired pickup orders today.';

  const renderOrderItem = ({ item, index }) => (
    <ReadyOrderCard
      key={`${item.id}-${index}`}
      order={item}
    />
  );

  const renderListFooter = () => {
    if (currentTabState.loadingMore) {
      return (
        <View className="py-4 items-center justify-center flex-row gap-2">
          <ActivityIndicator size="small" color={colors.buttonColor} />
          <Text style={{ fontFamily: 'Poppins-Medium', color: '#666', fontSize: 13 }}>
            Loading more orders...
          </Text>
        </View>
      );
    }
    return <View className="h-4" />;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tabs={readyTabs} 
        counts={counts}
      />

      {currentTabState.loading && (
        <View className="px-4 py-4 items-center flex-row gap-2">
          <ActivityIndicator size="small" color={colors.buttonColor} />
          <Text style={{ fontFamily: 'Poppins-Medium', color: '#666' }}>
            Loading orders...
          </Text>
        </View>
      )}

      {!!error && (
        <Text className="px-4 pb-2" style={{ fontFamily: 'Poppins-Medium', color: '#CC3A3A' }}>
          {error}
        </Text>
      )}

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={
          !currentTabState.loading ? (
            <Text className="px-4 py-6 text-center" style={{ fontFamily: 'Poppins-Medium', color: '#7A7A7A' }}>
              {emptyMessage}
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.buttonColor}
          />
        }
      />
    </View>
  );
};

export default Ready;
