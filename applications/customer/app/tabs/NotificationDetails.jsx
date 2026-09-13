import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfile } from '@src/shared/hooks/useProfile';

const getNotificationTitle = (typeStr, customTitle, statusStr) => {
  if (customTitle && typeof customTitle === 'string' && customTitle.trim()) {
    const t = customTitle.trim();
    if (t !== 'Notification' && t !== 'Order Status Updated' && t !== 'Notification Details') {
      return t;
    }
  }
  const type = String(typeStr || '').toLowerCase();
  const status = String(statusStr || '').toLowerCase();

  if (type.includes('orderpickupreminder') || type.includes('order_pickup_reminder') || status.includes('ready')) {
    return 'Your order is now ready for pickup!';
  }
  if (type.includes('orderplaced') || type.includes('order_placed') || status.includes('pending')) {
    return 'Order Placed Successfully!';
  }
  if (status.includes('preparing') || status.includes('processing')) {
    return 'Your order is being prepared!';
  }
  if (type.includes('ordercompleted') || type.includes('order_completed') || status.includes('completed')) {
    return 'Order Completed!';
  }
  if (type.includes('orderrejected') || type.includes('order_rejected') || status.includes('reject') || status.includes('cancel')) {
    return 'Order Cancelled';
  }
  if (type.includes('orderexpired') || type.includes('order_expired') || status.includes('expire')) {
    return 'Order Expired';
  }
  if (status.includes('stand_by') || type.includes('prescription')) {
    return 'Prescription Verification Required';
  }
  if (type.includes('discountidverified') || type.includes('discount_id')) {
    return 'Discount ID Verified!';
  }
  if (type.includes('adminalert')) {
    return 'System Alert';
  }

  return 'Notification Details';
};

const getCustomerNotificationMessage = ({
  statusStr,
  typeStr,
  customerFirstName,
  orderNumber,
  pharmacyName,
  location,
  originalMessage,
}) => {
  const s = String(statusStr || '').toLowerCase();
  const t = String(typeStr || '').toLowerCase();

  const greeting = customerFirstName?.trim() ? `Hi ${customerFirstName.trim()},` : 'Hello,';
  
  const formattedOrderNum = orderNumber
    ? (String(orderNumber).startsWith('#') ? String(orderNumber) : `#${orderNumber}`)
    : null;
  const orderRef = formattedOrderNum ? `order ${formattedOrderNum}` : 'your order';

  let branchText = '';
  if (pharmacyName && location) {
    branchText = ` at ${pharmacyName} - ${location}`;
  } else if (pharmacyName) {
    branchText = ` at ${pharmacyName}`;
  } else if (location) {
    branchText = ` at our branch in ${location}`;
  }

  if (s.includes('ready') || t.includes('pickup_reminder') || t.includes('ready')) {
    return `${greeting}\nGood news! Your ${orderRef} is now ready for pickup${branchText || ' at the pharmacy'}.\n\nPlease bring your reference number and a valid ID when you come to claim your medicines.\n\nThank you for choosing PharmaDali!`;
  }

  if (s.includes('preparing') || s.includes('processing')) {
    return `${greeting}\nGreat news! Your ${orderRef} is currently being prepared by our pharmacy team${branchText}.\n\nWe are carefully checking and packing your items. You will receive an alert once your order is ready for pickup.\n\nThank you for choosing PharmaDali!`;
  }

  if (s.includes('pending') || t.includes('order_placed') || t.includes('orderplaced')) {
    return `${greeting}\nGood news! Your ${orderRef} has been successfully placed${branchText}.\n\nOur pharmacists are currently reviewing your requested items and verifying your order details. We will notify you as soon as preparation begins.\n\nThank you for choosing PharmaDali!`;
  }

  if (s.includes('completed') || t.includes('order_completed') || t.includes('ordercompleted')) {
    return `${greeting}\nYour ${orderRef}${branchText ? ` from${branchText}` : ''} has been successfully completed and claimed.\n\nWe hope you had a pleasant experience. Please follow dosage instructions carefully and feel free to consult our pharmacists if you have any questions.\n\nThank you for choosing PharmaDali!`;
  }

  if (s.includes('reject') || s.includes('cancel') || t.includes('order_rejected') || t.includes('orderrejected')) {
    return `${greeting}\nWe regret to inform you that your ${orderRef}${branchText} could not be processed and has been cancelled.\n\nIf you have any questions regarding this cancellation, please contact the pharmacy directly or reach out through customer support.\n\nThank you for choosing PharmaDali!`;
  }

  if (s.includes('expire') || t.includes('order_expired') || t.includes('orderexpired')) {
    return `${greeting}\nThe pickup reservation window for your ${orderRef}${branchText} has expired.\n\nThe reserved items have been returned to pharmacy inventory. You may place a new order anytime through the shop.\n\nThank you for choosing PharmaDali!`;
  }

  if (s.includes('stand_by') || t.includes('prescription')) {
    return `${greeting}\nYour ${orderRef}${branchText} requires a valid prescription for verification.\n\nPlease view your order details to upload or resubmit your valid prescription so our pharmacists can evaluate your order.\n\nThank you for choosing PharmaDali!`;
  }

  if (t.includes('discount_id') || t.includes('discountidverified')) {
    return `${greeting}\nGreat news! Your special discount credentials have been successfully reviewed and verified by PharmaDali.\n\nYour discount will now be automatically applied to eligible prescribed purchases at checkout.\n\nThank you for choosing PharmaDali!`;
  }

  if (originalMessage && typeof originalMessage === 'string' && originalMessage.trim()) {
    if (originalMessage.includes('\n') || originalMessage.startsWith('Hi ') || originalMessage.startsWith('Hello ')) {
      return originalMessage.trim();
    }
    return `${greeting}\n${originalMessage.trim()}\n\nThank you for choosing PharmaDali!`;
  }

  return `${greeting}\nYou have a new notification update regarding your order with PharmaDali.\n\nPlease check your order details for the latest status.\n\nThank you for choosing PharmaDali!`;
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

export default function CustomerNotificationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useProfile();

  const getParam = (val) => (Array.isArray(val) ? val[0] : val);

  const id = getParam(params.id);
  const type = getParam(params.type);
  const rawTitle = getParam(params.title);
  const message = getParam(params.message);
  const orderId = getParam(params.orderId) || getParam(params.order_id);
  const rawOrderNumber = getParam(params.orderNumber) || getParam(params.order_number);
  const customerName =
    getParam(params.customerName) ||
    getParam(params.customer_name) ||
    getParam(params.customer);
  const pharmacyName =
    getParam(params.pharmacyName) ||
    getParam(params.pharmacy_name) ||
    getParam(params.pharmacy);
  const location =
    getParam(params.location) ||
    getParam(params.city);
  const orderDate =
    getParam(params.orderDate) ||
    getParam(params.order_date);
  const rawStatus =
    getParam(params.status) ||
    getParam(params.orderStatus) ||
    getParam(params.order_status);
  const createdAt =
    getParam(params.createdAt) ||
    getParam(params.created_at);

  // Extract order number from message if explicitly present (e.g. #ORD-... or ORD-...)
  const extractedOrderNumber =
    (message || '').match(/#?ORD-[A-Za-z0-9-]+/i)?.[0] || null;

  const resolvedOrderNumber =
    rawOrderNumber ||
    extractedOrderNumber ||
    (orderId ? `#ORD-${String(orderId).padStart(6, '0')}` : null);

  // Extract pharmacy / location from message only if present in message
  let extractedPharmacy = null;
  let extractedLocation = null;
  if (!pharmacyName || !location) {
    const atMatch = (message || '').match(/at\s+([^-.\n]+?)(?:\s*-\s*([^.\n]+))?(?:\.|$)/i);
    if (atMatch) {
      if (!pharmacyName && atMatch[1]) extractedPharmacy = atMatch[1].trim();
      if (!location && atMatch[2]) extractedLocation = atMatch[2].trim();
    }
  }

  const finalPharmacy = pharmacyName || extractedPharmacy || null;
  const finalLocation = location || extractedLocation || null;

  const customerFirstName =
    profile?.first_name?.trim() ||
    (customerName ? customerName.trim().split(' ')[0] : null);

  const displayTitle = getNotificationTitle(type, rawTitle, rawStatus);
  const displayMessage = getCustomerNotificationMessage({
    statusStr: rawStatus,
    typeStr: type,
    customerFirstName,
    orderNumber: resolvedOrderNumber,
    pharmacyName: finalPharmacy,
    location: finalLocation,
    originalMessage: message,
  });

  const hasOrderDetails = !!(orderId || resolvedOrderNumber || rawStatus);
  const displayOrderDate = orderDate ? formatDisplayTime(orderDate) : null;
  const displayTimestamp = formatDisplayTime(createdAt) || formatDisplayTime(orderDate) || 'Recent';

  const statusLabel = formatStatusText(rawStatus || 'ready_for_pickup');
  const statusStyle = getStatusStyles(rawStatus || 'ready_for_pickup');

  const handleViewOrder = () => {
    if (orderId) {
      router.push({
        pathname: '/tabs/orders/ViewOrderDetails',
        params: {
          orderId: String(orderId),
          orderNumber: resolvedOrderNumber || '',
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
                {resolvedOrderNumber ? (
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
                      {resolvedOrderNumber}
                    </Text>
                  </View>
                ) : null}

                {/* Pharmacy Name */}
                {finalPharmacy ? (
                  <View className="flex-row justify-between items-center py-2">
                    <Text
                      className="text-[12.5px] text-slate-500 shrink-0"
                      style={{ fontFamily: 'Poppins-SemiBold' }}
                    >
                      Pharmacy
                    </Text>
                    <Text
                      className="text-xs text-[#333333] text-right shrink ml-2"
                      style={{ fontFamily: 'Poppins-Regular' }}
                      numberOfLines={1}
                    >
                      {finalPharmacy}
                    </Text>
                  </View>
                ) : null}

                {/* Location */}
                {finalLocation ? (
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
                      {finalLocation}
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
            className="bg-[#54A9DA] rounded-xl py-3.5 items-center justify-center active:opacity-80 w-full"
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
