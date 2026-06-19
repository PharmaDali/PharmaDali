import { ScrollView, View, Text, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '@shared/theme/colorPalette';
import { Tabs, ReadyOrderCard } from '@components/pharmacist-orders-and-ready-components';
import BetadineImg from '@assets/images/betadine_img.png';
import MaleIcon from '@assets/icons/person-icons/male_icon.svg';
import FemaleIcon from '@assets/icons/person-icons/female_icon.svg';
import RecitImg from '@assets/images/recit_dummy.png';
import { formatDateToMMDDYYYY } from '@shared/utils/dateUtils';
import { getPharmacyOrders, updateOrderStatusByPharmacist } from '@shared/services/orderToPharmacistService';

const readyTabs = ['For Pickup', 'Completed', 'Expired'];

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
          size: product?.size || product?.strength || product?.form || '-',
          prescriptionRequired,
          prescriptionImage: hasPrescriptionImage ? { uri: `${baseUrl}/storage/${prescription.prescription_image_path}` } : null,
        };
      }),
    };
  }).filter(order => order.status !== null);
};

const Ready = () => {
  const [activeTab, setActiveTab] = useState('For Pickup');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      const data = await getPharmacyOrders();
      setOrders(mapApiOrdersToUiOrders(data));
    } catch (e) {
      setError(e?.message || 'Failed to load orders.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders(false);
    setRefreshing(false);
  }, [loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const counts = useMemo(() => {
    return readyTabs.reduce((acc, tab) => {
      acc[tab] = orders.filter((o) => o.status === tab).length;
      return acc;
    }, {});
  }, [orders]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => order.status === activeTab),
    [activeTab, orders]
  );
  const emptyMessage = activeTab === 'For Pickup'
    ? 'No orders are ready for pickup today.'
    : activeTab === 'Completed'
      ? 'No completed pickups today.'
      : 'No expired pickup orders today.';

  return (
    <View className="flex-1 bg-gray-50">
      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tabs={readyTabs} 
        counts={counts}
      />

      {loading && (
        <Text className="px-4 py-2" style={{ fontFamily: 'Poppins-Medium', color: '#666' }}>
          Loading orders...
        </Text>
      )}

      {!!error && (
        <Text className="px-4 pb-2" style={{ fontFamily: 'Poppins-Medium', color: '#CC3A3A' }}>
          {error}
        </Text>
      )}

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
        {!loading && filteredOrders.length === 0 && (
          <Text className="px-4 py-6 text-center" style={{ fontFamily: 'Poppins-Medium', color: '#7A7A7A' }}>
            {emptyMessage}
          </Text>
        )}

        {filteredOrders.map((order, idx) => (
          <ReadyOrderCard
            key={`${order.orderNumber}-${idx}`}
            order={order}
          />
        ))}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
};

export default Ready;
