import { View, ScrollView, Text } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, ReviewOrderCard, PreparingOrderCard, IssueOrderCard } from '@components/pharmacist-orders-and-ready-components';
import ActionReasonOverlay from '@shared/components/ActionReasonOverlay';
import BetadineImg from '@assets/images/betadine_img.png';
import MaleIcon from '@assets/icons/person-icons/male_icon.svg';
import { getBranchOrders, updateOrderStatusByPharmacist } from '@shared/services/orderToPharmacistService';

const orderTabs = ['For Review', 'Preparing', 'Issues'];


const mapApiStatusToTabStatus = (status) => {
  if (['pending', 'reviewing'].includes(status)) return 'For Review';
  if (['preparing', 'ready_for_pickup'].includes(status)) return 'Preparing';
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
      pickupTime: order?.scheduled_pickup_at || 'Schedule not set',
      submittedAgo: 'Recently',
      orderTotal: Number(order?.total_amount ?? 0).toFixed(2),
      status: mapApiStatusToTabStatus(order?.status),
      items: (order?.items || []).map((item) => {
        const product = item?.branch_product?.product;
        const prescription = item?.order_item_prescription;
        
        const prescriptionRequired = Boolean(product?.is_prescribed);
        const hasPrescriptionImage = Boolean(prescription?.prescription_image_path);

        return {
          img: BetadineImg,
          description: item?.product_name || 'Medicine item',
          price: Number(item?.unit_price_snapshot ?? 0).toFixed(2),
          quantity: item?.quantity ?? 0,
          size: '-',
          prescriptionRequired,
          prescriptionImage: hasPrescriptionImage ? { uri: `${baseUrl}/storage/${prescription.prescription_image_path}` } : null,
          status: itemStatus,
          rejectionReason: itemReason,
        };
      }),
    };
  });
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

  const handleApprove = async (order) => {
    const orderId = order?.id ?? order?.orderId ?? order?.orderNumber;

    if (!orderId) {
      return;
    }

    try {
      await updateOrderStatusByPharmacist(orderId, 'approve');
      await loadOrders();
    } catch {
      return;
    }
  };

  const handleReject = (order) => {
    setSelectedOrder(order);
    setOverlayAction('reject');
    setOverlayVisible(true);
  };

  const handlePending = (order) => {
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
    } catch {
      // Handle error if needed
    }
  };

  const handleMarkAsReady = (order) => {
    // TODO: handle mark as ready logic
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={orderTabs} />

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