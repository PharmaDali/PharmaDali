import { View, ScrollView, Text } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, ReviewOrderCard, PreparingOrderCard, IssueOrderCard } from '@components/pharmacist-orders-and-ready-components';
import ActionReasonOverlay from '@shared/components/ActionReasonOverlay';
import BetadineImg from '@assets/images/betadine_img.png';
import MaleIcon from '@assets/icons/person-icons/male_icon.svg';
import { getBranchOrders, updateOrderStatusByPharmacist } from '@shared/services/orderToPharmacistService';
import { formatDateToMMDDYYYY } from '@shared/utils/dateUtils';

const orderTabs = ['For Review', 'Preparing', 'Issues'];


const mapApiStatusToTabStatus = (status) => {
  const s = String(status || '').toLowerCase();
  if (['pending', 'reviewing'].includes(s)) return 'For Review';
  if (s === 'preparing') return 'Preparing';
  if (['cancelled', 'rejected', 'stand_by'].includes(s)) return 'Issues';
  if (['completed', 'ready_for_pickup', 'overdue'].includes(s)) return null;
  return 'Issues';
};

const mapApiOrdersToUiOrders = (apiOrders) => {
  if (!Array.isArray(apiOrders)) {
    return [];
  }

  return apiOrders.map((order) => {
    const customer = order?.customer?.user;
    const itemStatus = order?.status === 'cancelled' ? 'Rejected' : 'Pending';
    const itemReason = order?.cancellation_reason || 'Requires attention';
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
      apiStatus: String(order?.status || '').toLowerCase(),
      cancellationReason: order?.cancellation_reason || '',
      items: (order?.items || []).map((item) => {
        const product = item?.branch_product?.product;
        const prescription = item?.order_item_prescription;
        const categoryName = item?.branch_product?.category?.category_name
          || product?.category?.category_name
          || product?.category_name
          || '';
        const baseName = item?.product_name
          || product?.product_name
          || product?.brand_name
          || product?.generic_name
          || 'Medicine item';
        const strengthForm = [product?.strength, product?.form, product?.size].filter(Boolean).join(' ');
        const description = strengthForm ? `${baseName} (${strengthForm})` : baseName;
        
        const prescriptionRequired = Boolean(product?.is_prescribed);
        const hasPrescriptionImage = Boolean(prescription?.prescription_image_path);

        const apiStatus = String(order?.status || '').toLowerCase();
        let itemDisplayStatus = 'For Review';
        if (apiStatus === 'cancelled' || apiStatus === 'rejected') itemDisplayStatus = 'Rejected';
        if (apiStatus === 'stand_by') itemDisplayStatus = 'Awaiting Customer Response';
        if (apiStatus === 'preparing') itemDisplayStatus = 'Preparing';

        return {
          img: BetadineImg,
          product,
          categoryName,
          description,
          price: Number(item?.unit_price_snapshot ?? 0).toFixed(2),
          quantity: item?.quantity ?? 0,
          size: product?.strength || product?.form || product?.size || '-',
          prescriptionRequired,
          prescriptionImage: hasPrescriptionImage ? { uri: `${baseUrl}/storage/${prescription.prescription_image_path}` } : null,
          status: itemDisplayStatus,
          rejectionReason: order?.cancellation_reason || 'Requires attention',
        };
      }),
    };
  }).filter(order => order.status !== null);
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState('For Review');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reason Overlay State
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayAction, setOverlayAction] = useState('reject'); // 'reject' or 'pending'
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getBranchOrders();
      const mappedOrders = mapApiOrdersToUiOrders(data);
      setOrders(mappedOrders);
    } catch (e) {
      setError(e?.message || 'Failed to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const forReviewOrders = orders.filter((o) => o.status === 'For Review');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing');
  const issueOrders = orders.filter((o) => o.status === 'Issues');
  const activeOrders = activeTab === 'For Review'
    ? forReviewOrders
    : activeTab === 'Preparing'
      ? preparingOrders
      : issueOrders;
  const emptyMessage = activeTab === 'For Review'
    ? 'No orders awaiting review today.'
    : activeTab === 'Preparing'
      ? 'No orders are being prepared right now.'
      : 'No orders need attention today.';

  const tabCounts = {
    'For Review': forReviewOrders.length,
    'Preparing': preparingOrders.length,
    'Issues': issueOrders.length,
  };

  const handleApprove = async (order) => {
    const orderId = order?.id ?? order?.orderId ?? order?.orderNumber;

    if (!orderId) {
      return;
    }

    try {
      await updateOrderStatusByPharmacist(orderId, 'approve');
      await loadOrders();
    } catch (e) {
      console.error('[Orders] Error approving order:', e);
      setError(e?.message || 'Failed to approve order.');
    }
  };

  const handleReject = (order) => {
    setError('');
    setSelectedOrder(order);
    setOverlayAction('reject');
    setOverlayVisible(true);
  };

  const handlePending = (order) => {
    setError('');
    setSelectedOrder(order);
    setOverlayAction('pending');
    setOverlayVisible(true);
  };

  const handleReasonSubmit = async (reason) => {
    const orderId = selectedOrder?.id ?? selectedOrder?.orderId ?? selectedOrder?.orderNumber;
    if (!orderId) return;

    try {
      await updateOrderStatusByPharmacist(orderId, overlayAction, reason);
      setOverlayVisible(false);
      await loadOrders();
    } catch (e) {
      console.error(`[Orders] Error marking order as ${overlayAction}:`, e);
      setError(e?.message || `Failed to mark order as ${overlayAction}.`);
      setOverlayVisible(false);
    }
  };

  const handleMarkAsReady = async (order) => {
    const orderId = order?.id ?? order?.orderId ?? order?.orderNumber;
    if (!orderId) return;

    try {
      await updateOrderStatusByPharmacist(orderId, 'ready');
      await loadOrders();
    } catch (e) {
      console.error('[Orders] Error marking order as ready:', e);
      setError(e?.message || 'Failed to mark order as ready.');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tabs={orderTabs} 
        counts={tabCounts}
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {!loading && activeOrders.length === 0 && (
          <Text className="px-4 py-6 text-center" style={{ fontFamily: 'Poppins-Medium', color: '#7A7A7A' }}>
            {emptyMessage}
          </Text>
        )}

        {activeTab === 'For Review' &&
          forReviewOrders.map((order, idx) => (
            <ReviewOrderCard key={idx} order={order} onApprove={handleApprove} onReject={handleReject} onPending={handlePending} />
          ))}

        {activeTab === 'Preparing' &&
          preparingOrders.map((order, idx) => (
            <PreparingOrderCard key={idx} order={order} onMarkAsReady={handleMarkAsReady} />
          ))}

        {activeTab === 'Issues' &&
          issueOrders.map((order, idx) => (
            <IssueOrderCard key={idx} order={order} />
          ))}

        <View className="h-4" />
      </ScrollView>

      <ActionReasonOverlay
        visible={overlayVisible}
        actionType={overlayAction}
        onClose={() => setOverlayVisible(false)}
        onSubmit={handleReasonSubmit}
      />
    </View>
  );
}