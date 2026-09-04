import { View, FlatList, Text, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import { Tabs, ReviewOrderCard, PreparingOrderCard, IssueOrderCard } from '@components/pharmacist-orders-and-ready-components';
import ActionReasonOverlay from '@shared/components/ActionReasonOverlay';
import MaleIcon from '@assets/icons/person-icons/male_icon.svg';
import { getPharmacyOrders, updateOrderStatusByPharmacist } from '@shared/services/orderToPharmacistService';
import { formatDateToMMDDYYYY } from '@shared/utils/dateUtils';
import { colors } from '@shared/theme/colorPalette';

const orderTabs = ['For Review', 'Preparing', 'Issues'];

const tabApiMap = {
  'For Review': 'for_review',
  'Preparing':  'preparing',
  'Issues':     'issues',
};

const mapApiStatusToTabStatus = (status) => {
  const s = String(status || '').toLowerCase();
  if (['pending', 'reviewing', 'awaiting_payment'].includes(s)) return 'For Review';
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
    const baseUrl = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');

    return {
      id: order.id,
      orderNumber: order.order_number || String(order.id),
      customerName: `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Customer',
      customerAvatar: MaleIcon,
      pickupTime: (order?.scheduled_pickup_at || order?.placed_at || order?.created_at)
        ? (formatDateToMMDDYYYY(order?.scheduled_pickup_at || order?.placed_at || order?.created_at) || 'Waiting...')
        : 'Waiting...',
      submittedAgo: formatDateToMMDDYYYY(order?.created_at) || 'Recently',
      orderTotal: Number(order?.total_amount ?? 0).toFixed(2),
      status: mapApiStatusToTabStatus(order?.status),
      apiStatus: String(order?.status || '').toLowerCase(),
      cancellationReason: order?.cancellation_reason || '',
      discountType: order?.discount_type || null,
      discountIdNumber: order?.discount_id_number || null,
      discountRemarks: order?.discount_remarks || null,
      discountIdImagePath: order?.discount_id_image_path ? `${baseUrl}/storage/${order.discount_id_image_path}` : null,
      paymentReceiptImagePath: order?.payment_receipt_image_path ? `${baseUrl}/storage/${order.payment_receipt_image_path}` : null,
      paymentMethod: order?.payment_method || null,
      paymentStatus: order?.payment_status || null,
      note: order?.note || null,
      items: (order?.items || []).map((item) => {
        const product = item?.pharmacy_product?.product;
        const prescription = item?.order_item_prescription;
        const categoryName = item?.pharmacy_product?.category?.category_name
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
        if (apiStatus === 'awaiting_payment') itemDisplayStatus = 'Awaiting Payment';
        if (apiStatus === 'preparing') itemDisplayStatus = 'Preparing';

        return {
          img: product?.image_url || null,
          product,
          categoryName,
          description,
          price: Number(item?.unit_price_snapshot ?? 0).toFixed(2),
          quantity: item?.quantity ?? 0,
          sizeLabel: product?.size ? 'Size' : (product?.strength ? 'Dosage' : 'Size'),
          size: product?.size || product?.strength || '-',
          prescriptionRequired,
          prescriptionImage: hasPrescriptionImage ? { uri: `${baseUrl}/storage/${prescription.prescription_image_path}` } : null,
          prescriptionStatus: prescription?.status || null,
          status: itemDisplayStatus,
          rejectionReason: order?.cancellation_reason || 'Requires attention',
        };
      }),
    };
  }).filter(order => order.status !== null);
};

export default function Orders() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialTab = params?.tab && orderTabs.includes(params.tab) ? params.tab : 'For Review';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [hasNewIssues, setHasNewIssues] = useState(false);
  const [lastSeenIssuesStr, setLastSeenIssuesStr] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync('lastSeenIssues').then(val => {
      setLastSeenIssuesStr(val || '[]');
    });
  }, []);

  useEffect(() => {
    if (params?.tab && orderTabs.includes(params.tab)) {
      setActiveTab(params.tab);
    }
  }, [params?.tab]);

  // Per-Tab State for Lazy Loading & Infinite Scrolling
  const [tabStates, setTabStates] = useState({
    'For Review': { items: [], page: 1, hasMore: true, loaded: false, loading: false, loadingMore: false, total: 0 },
    'Preparing':  { items: [], page: 1, hasMore: true, loaded: false, loading: false, loadingMore: false, total: 0 },
    'Issues':     { items: [], page: 1, hasMore: true, loaded: false, loading: false, loadingMore: false, total: 0 },
  });

  // Reason Overlay State
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayAction, setOverlayAction] = useState('reject');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status Feedback Modal State
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState('approve');

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

  // Lazy Loading & Initial Load
  useEffect(() => {
    if (!tabStates[activeTab]?.loaded && !tabStates[activeTab]?.loading) {
      fetchTabOrders(activeTab, 1);
    }
  }, [activeTab, fetchTabOrders, tabStates]);

  // Real-time Auto-Sync: Auto-refresh on screen focus and poll silently every 6s
  useFocusEffect(
    useCallback(() => {
      // Initially fetch all tabs to hydrate counts and the issues array
      fetchTabOrders('For Review', 1, true).then(() => {
        fetchTabOrders('Preparing', 1, true).then(() => {
          fetchTabOrders('Issues', 1, true);
        });
      });

      const interval = setInterval(() => {
        // Fetch all tabs sequentially to keep counts and the new issue badge in sync
        fetchTabOrders('For Review', 1, true).then(() => {
          fetchTabOrders('Preparing', 1, true).then(() => {
            fetchTabOrders('Issues', 1, true);
          });
        });
      }, 6000);

      return () => clearInterval(interval);
    }, [activeTab, fetchTabOrders])
  );

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

  useEffect(() => {
    const issuesData = tabStates['Issues'].items.map(i => ({
      id: i.id,
      discountRemarks: i.discountRemarks,
      note: i.note,
      status: i.status
    }));
    const currentStr = JSON.stringify(issuesData);

    if (activeTab === 'Issues') {
      setHasNewIssues(false);
      setLastSeenIssuesStr(currentStr);
      SecureStore.setItemAsync('lastSeenIssues', currentStr);
    } else {
      if (lastSeenIssuesStr !== null && currentStr !== lastSeenIssuesStr && issuesData.length > 0) {
        setHasNewIssues(true);
      }
    }
  }, [activeTab, tabStates['Issues'].items, lastSeenIssuesStr]);

  const currentTabState = tabStates[activeTab] || { items: [], loading: false, loadingMore: false, total: 0 };
  const activeOrders = currentTabState.items;

  const tabCounts = {
    'For Review': tabStates['For Review'].total,
    'Preparing':  tabStates['Preparing'].total,
    'Issues':     tabStates['Issues'].total,
  };

  const emptyMessage = activeTab === 'For Review'
    ? 'No orders awaiting review today.'
    : activeTab === 'Preparing'
      ? 'No orders are being prepared right now.'
      : 'No orders need attention today.';

  const reloadActiveTab = async () => {
    await fetchTabOrders(activeTab, 1);
  };

  const handleApprove = async (order, section = null) => {
    const orderId = order?.id ?? order?.orderId ?? order?.orderNumber;
    if (!orderId) return;

    setError('');
    const previousTabStates = JSON.parse(JSON.stringify(tabStates));

    // A GCash order with unpaid payment will become awaiting_payment (stays in For Review)
    const isGcashAwaitingPayment = !section
      && order.paymentMethod === 'gcash'
      && order.paymentStatus !== 'paid';

    if (!section && !isGcashAwaitingPayment) {
      // Optimistic UI: Immediately remove order from 'For Review' UI list for general approval
      setTabStates((prev) => {
        const forReview = prev['For Review'];
        const updatedItems = (forReview.items || []).filter((item) => item.id !== order.id);
        return {
          ...prev,
          'For Review': {
            ...forReview,
            items: updatedItems,
            total: Math.max(0, (forReview.total || 1) - 1),
          },
          'Preparing': {
            ...prev['Preparing'],
            loaded: false,
          },
        };
      });

      setFeedbackAction('approve');
      setFeedbackVisible(true);
    }

    try {
      await updateOrderStatusByPharmacist(orderId, 'approve', null, section);
      if (!section && !isGcashAwaitingPayment) {
        setActiveTab('Preparing');
        fetchTabOrders('Preparing', 1, true);
      } else {
        fetchTabOrders(activeTab, 1, true);
      }
    } catch (e) {
      console.error('[Orders] Error approving order:', e);
      setError(e?.message || 'Failed to approve order.');
      if (!section) setTabStates(previousTabStates);
    }
  };

  const [selectedSection, setSelectedSection] = useState(null);

  const handleReject = (order, section = null) => {
    setError('');
    setSelectedOrder(order);
    setSelectedSection(section);
    setOverlayAction('reject');
    setOverlayVisible(true);
  };

  const handleOutPending = async (order) => {
    const orderId = order?.id ?? order?.orderId ?? order?.orderNumber;
    if (!orderId) return;

    setError('');
    const previousTabStates = JSON.parse(JSON.stringify(tabStates));

    try {
      await updateOrderStatusByPharmacist(orderId, 'out_pending');
      fetchTabOrders('For Review', 1, true);
      fetchTabOrders('Issues', 1, true);
    } catch (e) {
      console.error('[Orders] Error removing order from pending:', e);
      setError(e?.message || 'Failed to remove order from pending status.');
      setTabStates(previousTabStates);
    }
  };

  const handlePending = (order) => {
    setError('');
    setSelectedOrder(order);
    setSelectedSection(null);
    setOverlayAction('pending');
    setOverlayVisible(true);
  };

  const handleReasonSubmit = async (reason) => {
    const orderId = selectedOrder?.id ?? selectedOrder?.orderId ?? selectedOrder?.orderNumber;
    if (!orderId) return;

    setError('');
    const action = overlayAction;
    const targetOrderId = selectedOrder?.id;
    const targetSection = selectedSection;
    setOverlayVisible(false);
    setSelectedSection(null);
    const previousTabStates = JSON.parse(JSON.stringify(tabStates));

    // Optimistic UI: Immediately remove order from 'For Review' UI list
    setTabStates((prev) => {
      const forReview = prev['For Review'];
      const updatedItems = (forReview.items || []).filter((item) => item.id !== targetOrderId);
      return {
        ...prev,
        'For Review': {
          ...forReview,
          items: updatedItems,
          total: Math.max(0, (forReview.total || 1) - 1),
        },
        'Issues': {
          ...prev['Issues'],
          loaded: false,
        },
      };
    });

    setFeedbackAction(action);
    setFeedbackVisible(true);

    try {
      await updateOrderStatusByPharmacist(orderId, action, reason, targetSection);
      fetchTabOrders(activeTab, 1, true);
    } catch (e) {
      console.error(`[Orders] Error marking order as ${action}:`, e);
      setError(e?.message || `Failed to mark order as ${action}.`);
      setTabStates(previousTabStates);
    }
  };

  const handleMarkAsReady = async (order) => {
    const orderId = order?.id ?? order?.orderId ?? order?.orderNumber;
    if (!orderId) return;

    setError('');
    const previousTabStates = JSON.parse(JSON.stringify(tabStates));

    // Optimistic UI: Immediately remove order from 'Preparing' UI list
    setTabStates((prev) => {
      const preparing = prev['Preparing'];
      const updatedItems = (preparing.items || []).filter((item) => item.id !== order.id);
      return {
        ...prev,
        'Preparing': {
          ...preparing,
          items: updatedItems,
          total: Math.max(0, (preparing.total || 1) - 1),
        },
      };
    });

    setFeedbackAction('ready');
    setFeedbackVisible(true);

    try {
      await updateOrderStatusByPharmacist(orderId, 'ready');
      fetchTabOrders(activeTab, 1, true);
      router.push('/tabs/ready/Ready');
    } catch (e) {
      console.error('[Orders] Error marking order as ready:', e);
      setError(e?.message || 'Failed to mark order as ready.');
      setTabStates(previousTabStates);
    }
  };

  const renderOrderItem = ({ item }) => {
    if (activeTab === 'For Review') {
      return <ReviewOrderCard order={item} onApprove={handleApprove} onReject={handleReject} onPending={handlePending} />;
    }
    if (activeTab === 'Preparing') {
      return <PreparingOrderCard order={item} onMarkAsReady={handleMarkAsReady} />;
    }
    return <IssueOrderCard order={item} onOutPending={handleOutPending} />;
  };

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
        tabs={orderTabs} 
        counts={tabCounts}
        hasNewIssueMarker={hasNewIssues}
      />

      {!!error && (
        <Text className="px-4 pb-2" style={{ fontFamily: 'Poppins-Medium', color: '#CC3A3A' }}>
          {error}
        </Text>
      )}

      <FlatList
        data={activeOrders}
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
            colors={[colors.buttonColor]}
            tintColor={colors.buttonColor}
          />
        }
      />

      <ActionReasonOverlay
        visible={overlayVisible}
        actionType={overlayAction}
        section={selectedSection}
        onClose={() => setOverlayVisible(false)}
        onSubmit={handleReasonSubmit}
      />

      <StatusFeedbackModal
        visible={feedbackVisible}
        actionType={feedbackAction}
        onClose={() => setFeedbackVisible(false)}
      />
    </View>
  );
}
