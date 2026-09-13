import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiRequest } from '@shared/api/client';

const getNotificationTitle = (typeStr, customTitle, statusStr) => {
  if (customTitle && typeof customTitle === 'string' && customTitle.trim()) {
    const t = customTitle.trim();
    if (t !== 'Notification' && t !== 'Order Status Updated' && t !== 'Notification Details') {
      return t;
    }
  }
  const type = String(typeStr || '').toLowerCase();
  const status = String(statusStr || '').toLowerCase();

  if (type.includes('neworderpharmacist') || type.includes('new_order') || (status.includes('pending') && !status.includes('stand_by'))) {
    return 'New Order Received!';
  }
  if (type.includes('prescription_reuploaded') || type.includes('prescriptionreuploaded') || status.includes('reviewing') || status.includes('out_pending')) {
    return 'Prescription Re-uploaded for Review';
  }
  if (type.includes('orderpickupreminder') || type.includes('order_pickup_reminder') || status.includes('ready')) {
    return 'Order Ready for Pickup';
  }
  if (status.includes('preparing') || status.includes('processing')) {
    return 'Order In Preparation';
  }
  if (type.includes('ordercompleted') || type.includes('order_completed') || status.includes('completed')) {
    return 'Order Completed';
  }
  if (type.includes('orderrejected') || type.includes('order_rejected') || status.includes('reject') || status.includes('cancel')) {
    return 'Order Cancelled';
  }
  if (type.includes('orderexpired') || type.includes('order_expired') || status.includes('expire')) {
    return 'Order Expired';
  }
  if (status.includes('stand_by')) {
    return 'Order On Hold - Prescription Required';
  }
  if (type.includes('adminalert')) {
    return 'System Alert';
  }

  return 'Notification Details';
};

const getPharmacistNotificationMessage = ({
  statusStr,
  typeStr,
  customerName,
  orderNumber,
  location,
  originalMessage,
}) => {
  const s = String(statusStr || '').toLowerCase();
  const t = String(typeStr || '').toLowerCase();

  const formattedOrderNum = orderNumber
    ? (String(orderNumber).startsWith('#') ? String(orderNumber) : `#${orderNumber}`)
    : null;

  const orderRef = formattedOrderNum ? `order ${formattedOrderNum}` : 'an order';
  const orderRefCapitalized = formattedOrderNum ? `Order ${formattedOrderNum}` : 'The order';

  const customerBy = customerName?.trim() ? ` by customer ${customerName.trim()}` : '';
  const customerFor = customerName?.trim() ? ` for ${customerName.trim()}` : '';
  const customerLead = customerName?.trim() ? `Customer ${customerName.trim()}` : 'The customer';

  const branchText = location?.trim() ? ` for your branch in ${location.trim()}` : ' for your pharmacy branch';
  const atLocation = location?.trim() ? ` at your branch in ${location.trim()}` : '';

  if (t.includes('neworderpharmacist') || t.includes('new_order') || (s.includes('pending') && !s.includes('stand_by'))) {
    const placedText = formattedOrderNum
      ? `order ${formattedOrderNum} has been placed`
      : 'order has been placed';
    return `Hello Pharmacist,\nA new ${placedText}${customerBy}${branchText}.\n\nPlease review the requested medicines, inventory stock availability, and any attached prescriptions to proceed with order preparation.\n\nThank you for serving with PharmaDali!`;
  }

  if (t.includes('prescription_reuploaded') || t.includes('prescriptionreuploaded') || s.includes('reviewing') || s.includes('out_pending')) {
    return `Hello Pharmacist,\n${customerLead} has submitted an updated prescription for ${orderRef}.\n\nThe order is now in your review queue. Please evaluate the new prescription image to approve or decline the order.\n\nThank you for serving with PharmaDali!`;
  }

  if (s.includes('ready') || t.includes('order_pickup_reminder') || t.includes('ready')) {
    return `Hello Pharmacist,\n${orderRefCapitalized}${customerFor} is now ready for in-store pickup${atLocation}.\n\nThe customer has been notified with pickup instructions and will present their valid ID and reference number upon claiming.\n\nThank you for serving with PharmaDali!`;
  }

  if (s.includes('preparing') || s.includes('processing')) {
    return `Hello Pharmacist,\n${orderRefCapitalized}${customerFor} is currently marked as in preparation${atLocation}.\n\nPlease ensure all items and batch numbers are properly inspected and packed before transitioning the status to ready for pickup.\n\nThank you for serving with PharmaDali!`;
  }

  if (s.includes('completed') || t.includes('order_completed') || t.includes('ordercompleted')) {
    return `Hello Pharmacist,\n${orderRefCapitalized}${customerFor} has been successfully completed and claimed.\n\nThe transaction has been recorded, and batch inventory deductions have been synchronized.\n\nThank you for serving with PharmaDali!`;
  }

  if (s.includes('reject') || s.includes('cancel') || t.includes('order_rejected') || t.includes('orderrejected')) {
    return `Hello Pharmacist,\n${orderRefCapitalized}${customerFor} has been cancelled.\n\nReserved stock batches have been unreserved and restored to inventory. No further fulfillment action is required.\n\nThank you for serving with PharmaDali!`;
  }

  if (s.includes('expire') || t.includes('order_expired') || t.includes('orderexpired')) {
    return `Hello Pharmacist,\n${orderRefCapitalized}${customerFor} exceeded its pickup reservation window and has expired.\n\nThe reserved items have been restored to available pharmacy stock.\n\nThank you for serving with PharmaDali!`;
  }

  if (s.includes('stand_by')) {
    return `Hello Pharmacist,\n${orderRefCapitalized}${customerFor} is currently on hold awaiting prescription submission or verification.\n\nNo preparation action is required until the customer submits a valid prescription.\n\nThank you for serving with PharmaDali!`;
  }

  if (originalMessage && typeof originalMessage === 'string' && originalMessage.trim()) {
    if (originalMessage.includes('\n') || originalMessage.startsWith('Hello ') || originalMessage.startsWith('Hi ')) {
      return originalMessage.trim();
    }
    return `Hello Pharmacist,\n${originalMessage.trim()}\n\nThank you for serving with PharmaDali!`;
  }

  return `Hello Pharmacist,\nYou have an update regarding ${orderRef}${customerFor}.\n\nPlease check the orders tab for details.\n\nThank you for serving with PharmaDali!`;
};

const formatStatusText = (statusStr) => {
  if (!statusStr) return 'Ready for Pickup';
  const raw = String(statusStr).toLowerCase().replace(/_/g, ' ');
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
};

const getStatusStyles = (statusStr) => {
  const s = String(statusStr || '').toLowerCase();
  if (s.includes('ready') || s.includes('completed') || s.includes('approved')) {
    return {
      bg: '#D4EDDA',
      border: '#60B17E',
      text: '#14532D',
    };
  }
  if (s.includes('preparing') || s.includes('processing')) {
    return {
      bg: '#D1ECF1',
      border: '#48AAD9',
      text: '#0C5460',
    };
  }
  if (s.includes('reject') || s.includes('cancel') || s.includes('expire')) {
    return {
      bg: '#FEE2E2',
      border: '#EF4444',
      text: '#991B1B',
    };
  }
  if (s.includes('overdue')) {
    return {
      bg: '#FFF4E5',
      border: 'rgba(255, 178, 89, 0.70)',
      text: '#D35400',
    };
  }
  if (s.includes('stand_by') || s.includes('pending')) {
    return {
      bg: '#FFF9C4',
      border: '#F59E0B',
      text: '#92400E',
    };
  }
  return {
    bg: '#D4EDDA',
    border: '#60B17E',
    text: '#14532D',
  };
};

const formatDisplayTime = (rawDate) => {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return String(rawDate);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const hr = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yr}-${mo}-${da} ${hr}:${mi}`;
  } catch {
    return String(rawDate);
  }
};

export default function PharmacistNotificationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const getParam = (val) => (Array.isArray(val) ? val[0] : val);

  const id = getParam(params.id);
  const type = getParam(params.type);
  const rawTitle = getParam(params.title);
  const message = getParam(params.message);
  const orderId = getParam(params.orderId) || getParam(params.order_id);
  const rawOrderNumber = getParam(params.orderNumber) || getParam(params.order_number);
  const rawCustomerName =
    getParam(params.customerName) ||
    getParam(params.customer_name) ||
    getParam(params.customer) ||
    getParam(params.userName) ||
    getParam(params.user_name) ||
    getParam(params.name);
  const rawLocation = getParam(params.location) || getParam(params.city);
  const rawOrderDate = getParam(params.orderDate) || getParam(params.order_date);
  const rawStatus = getParam(params.status) || getParam(params.orderStatus) || getParam(params.order_status);
  const createdAt = getParam(params.createdAt) || getParam(params.created_at);

  const [fetchedOrder, setFetchedOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;
    (async () => {
      try {
        const res = await apiRequest(`/pharmacist/orders/${orderId}`);
        if (isMounted && res?.data) {
          setFetchedOrder(res.data);
        }
      } catch (err) {
        // Silently continue with available params
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const fetchedUser = fetchedOrder?.customer?.user;
  const fetchedCustomerName = fetchedUser
    ? `${fetchedUser.first_name || ''} ${fetchedUser.last_name || ''}`.trim()
    : (fetchedOrder?.customer_name || null);

  const fetchedLocation = fetchedOrder?.pharmacy?.location || fetchedOrder?.pharmacy?.city || null;
  const fetchedOrderNumber = fetchedOrder?.order_number || null;
  const fetchedOrderDate = fetchedOrder?.placed_at || fetchedOrder?.created_at || null;
  const fetchedStatus = fetchedOrder?.status || null;

  // Robust order number extraction (check params, regex in message, fetched order, or orderId)
  const extractedOrderNumber =
    (message || '').match(/#?ORD-[A-Za-z0-9-]+/i)?.[0] || null;

  const resolvedOrderNumber =
    rawOrderNumber ||
    fetchedOrderNumber ||
    extractedOrderNumber ||
    (orderId ? `#ORD-${String(orderId).padStart(6, '0')}` : null);

  const finalOrderNumber = resolvedOrderNumber
    ? (String(resolvedOrderNumber).startsWith('#') ? String(resolvedOrderNumber) : `#${resolvedOrderNumber}`)
    : null;

  const displayCustomer = (rawCustomerName || fetchedCustomerName)?.trim() || null;
  const displayLocation = (rawLocation || fetchedLocation)?.trim() || null;
  const effectiveStatus = rawStatus || fetchedStatus || null;
  const displayOrderDate = (rawOrderDate || fetchedOrderDate)
    ? formatDisplayTime(rawOrderDate || fetchedOrderDate)
    : null;
  const displayTimestamp = formatDisplayTime(createdAt) || formatDisplayTime(rawOrderDate) || 'Recent';

  const displayTitle = getNotificationTitle(type, rawTitle, effectiveStatus);
  const displayMessage = getPharmacistNotificationMessage({
    statusStr: effectiveStatus,
    typeStr: type,
    customerName: displayCustomer,
    orderNumber: finalOrderNumber,
    location: displayLocation,
    originalMessage: message,
  });

  const isOrderRelated =
    !!(orderId || finalOrderNumber || effectiveStatus || String(type || '').toLowerCase().includes('order') || String(message || '').toLowerCase().includes('order'));

  const hasOrderDetails = isOrderRelated;

  const statusLabel = formatStatusText(effectiveStatus || 'ready_for_pickup');
  const statusStyle = getStatusStyles(effectiveStatus || 'ready_for_pickup');

  const handleViewOrder = () => {
    if (orderId) {
      router.push({
        pathname: '/tabs/orders/Orders',
        params: {
          highlightOrderId: String(orderId),
          orderNumber: finalOrderNumber || '',
        },
      });
    } else if (hasOrderDetails) {
      router.push('/tabs/orders/Orders');
    } else {
      try {
        router.back();
      } catch {
        router.replace('/tabs/Notifications');
      }
    }
  };

  return (
    <View className="flex-1 bg-[#F1F4FF]">
      <ScrollView
        className="flex-1 bg-[#F1F4FF]"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-2xl text-[#333333] mt-2 mb-2 mx-1"
          style={{ fontFamily: 'Poppins-SemiBold' }}
        >
          Notifications Details
        </Text>

        {/* Main White Details Card */}
        <View
          className="bg-white rounded-3xl p-5 mt-2"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          {/* Metadata Row: Dot + "Notification" left, Timestamp right */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-[#48AAD9] mr-2" />
              <Text
                className="text-xs text-[#333333]"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Notification
              </Text>
            </View>
            <Text
              className="text-xs text-slate-400"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {displayTimestamp}
            </Text>
          </View>

          {/* Thin separator line */}
          <View className="h-[1px] bg-slate-100 mb-4" />

          {/* Notification Main Title */}
          <Text
            className="text-[17px] text-[#333333] mb-3 leading-6"
            style={{ fontFamily: 'Poppins-SemiBold' }}
          >
            {displayTitle}
          </Text>

          {/* Notification Message Body */}
          <Text
            className="text-[13px] text-[#333333] leading-[21px] mb-5"
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {displayMessage}
          </Text>

          {/* Order Details Inset Card */}
          {hasOrderDetails && (
            <>
              <Text
                className="text-[15px] text-[#333333] mb-3"
                style={{ fontFamily: 'Poppins-SemiBold' }}
              >
                Order Details
              </Text>

              <View className="bg-[#F0F6FF] rounded-2xl px-4 py-3 mb-6">
                {/* Order Number */}
                {finalOrderNumber ? (
                  <View className="flex-row justify-between items-center py-2">
                    <Text
                      className="text-[12.5px] text-slate-500 shrink-0"
                      style={{ fontFamily: 'Poppins-SemiBold' }}
                    >
                      Order Number
                    </Text>
                    <Text
                      className="text-xs text-[#333333] text-right shrink ml-2"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {finalOrderNumber}
                    </Text>
                  </View>
                ) : null}

                {/* Customer Name */}
                {displayCustomer ? (
                  <View className="flex-row justify-between items-center py-2">
                    <Text
                      className="text-[12.5px] text-slate-500 shrink-0"
                      style={{ fontFamily: 'Poppins-SemiBold' }}
                    >
                      Customer
                    </Text>
                    <Text
                      className="text-xs text-[#333333] text-right shrink ml-2"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={1}
                    >
                      {displayCustomer}
                    </Text>
                  </View>
                ) : null}

                {/* Location */}
                {displayLocation ? (
                  <View className="flex-row justify-between items-center py-2">
                    <Text
                      className="text-[12.5px] text-slate-500 shrink-0"
                      style={{ fontFamily: 'Poppins-SemiBold' }}
                    >
                      Location
                    </Text>
                    <Text
                      className="text-xs text-[#333333] text-right shrink ml-2"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={1}
                    >
                      {displayLocation}
                    </Text>
                  </View>
                ) : null}

                {/* Order Date */}
                {displayOrderDate ? (
                  <View className="flex-row justify-between items-center py-2">
                    <Text
                      className="text-[12.5px] text-slate-500 shrink-0"
                      style={{ fontFamily: 'Poppins-SemiBold' }}
                    >
                      Order Date
                    </Text>
                    <Text
                      className="text-xs text-[#333333] text-right shrink ml-2"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={1}
                    >
                      {displayOrderDate}
                    </Text>
                  </View>
                ) : null}

                {/* Status Row */}
                <View className="flex-row justify-between items-center py-2">
                  <Text
                    className="text-[12.5px] text-slate-500 shrink-0"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    Status
                  </Text>
                  <View
                    className="px-3 py-1 rounded-lg border overflow-hidden"
                    style={{
                      backgroundColor: statusStyle.bg,
                      borderColor: statusStyle.border,
                    }}
                  >
                    <Text
                      className="text-xs"
                      style={{
                        color: statusStyle.text,
                        fontFamily: 'Poppins-SemiBold',
                      }}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Action Button: View Order */}
          <TouchableOpacity
            onPress={handleViewOrder}
            activeOpacity={0.8}
            className="bg-[#54A9DA] rounded-xl py-2.5 items-center justify-center active:opacity-80 w-full"
          >
            <Text
              className="text-[15px] text-white"
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {hasOrderDetails ? 'View Order' : 'Back to Notifications'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
