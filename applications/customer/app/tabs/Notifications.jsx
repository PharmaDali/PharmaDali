import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'expo-router'
import ClockIcon from '@assets/icons/clock_icon.svg'
import { useNotifications } from '@shared/hooks/useNotifications'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import ClearNotificationsOverlay from '@shared/components/ClearNotificationsOverlay'

const PAGE_SIZE = 10;

const getParsedData = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

const getNotificationTitle = (typeStr) => {
  const type = String(typeStr || '');
  if (type.includes('OrderPlaced')) return 'Order Placed';
  if (type.includes('OrderCompleted')) return 'Order Completed';
  if (type.includes('OrderExpired')) return 'Order Expired';
  if (type.includes('OrderRejected')) return 'Order Rejected';
  if (type.includes('OrderStatus')) return 'Order Status Updated';
  if (type.includes('DiscountIdVerified')) return 'Discount ID Verification';
  if (type.includes('PaymentReceiptVerified')) return 'Payment Verification';
  if (type.includes('AdminAlert')) return 'System Alert';
  if (type.includes('NewOrderPharmacist')) return 'New Order';
  return 'Notification';
};

const getNotificationMessage = (parsedData) => {
  return (
    parsedData.message ||
    parsedData.body ||
    parsedData.text ||
    parsedData.alert ||
    parsedData.description ||
    parsedData.content ||
    'You have a new notification.'
  );
};


const Notifications = () => {
  const router = useRouter();
  const { notifications, loading, refetch, markAsRead, removeNotification, clearAll, timeAgo } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [isClearOverlayVisible, setIsClearOverlayVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (item) => {
    if (!item.read_at) {
      await markAsRead(item.id);
    }

    const parsedData = getParsedData(item.data);
    if (parsedData.order_id) {
      router.push({
        pathname: '/tabs/orders/ViewOrderDetails',
        params: {
          orderId: String(parsedData.order_id),
          orderNumber: parsedData.order_number,
        },
      });
      return;
    }

    const type = String(item?.type || '');
    if (
      type.includes('OrderCompleted') ||
      type.includes('OrderExpired') ||
      type.includes('OrderRejected')
    ) {
      router.push({ pathname: '/tabs/orders/Orders', params: { tab: 'completed' } });
      return;
    }
    if (type.includes('OrderPlaced') || type.includes('OrderStatus')) {
      router.push('/tabs/orders/Orders');
    }
  };

  const displayedNotifications = notifications.slice(0, page * PAGE_SIZE);
  const hasMore = displayedNotifications.length < notifications.length;

  const loadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading, refreshing]);

  const renderItem = ({ item }) => {
    const parsedData = getParsedData(item.data);
    const itemType = String(item?.type || '');

    const title =
      typeof parsedData.title === 'string' && parsedData.title.trim()
        ? parsedData.title.trim()
        : getNotificationTitle(itemType);

    const message = getNotificationMessage(parsedData);

    return (
      <SwipeableNotificationCard
        key={item.id}
        itemId={item.id}
        onSwipeDelete={() => removeNotification(item.id)}
        onPress={() => handleNotificationPress(item)}
        isRead={!!item.read_at}
        title={title}
        message={message}
        timestamp={timeAgo(item.created_at || item.dateTime)}
      />
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F1F4FF]">
        <ActivityIndicator size="large" color="#48AAD9" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F1F4FF]">
      <FlatList
        className="flex-1 bg-[#F1F4FF]"
        showsVerticalScrollIndicator={false}
        data={displayedNotifications}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#48AAD9']} tintColor="#48AAD9" />
        }
        ListHeaderComponent={
          <>
            <View className="flex-row items-center justify-between px-0 pt-6 pb-2">
              <Text
                className="text-2xl text-slate-800"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                Notifications
              </Text>
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={() => setIsClearOverlayVisible(true)}
                  className="flex-row items-center px-3 py-1.5 rounded-full bg-sky-50 active:bg-sky-100"
                >
                  <MaterialCommunityIcons name="delete-sweep-outline" size={18} color="#48AAD9" />
                  <Text
                    className="text-xs font-semibold text-[#48AAD9] ml-1"
                    style={{ fontFamily: 'Poppins-SemiBold' }}
                  >
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="h-px bg-gray-200 mb-2" />
          </>
        }
        ListEmptyComponent={<EmptyState message="No notifications available" />}
        ListFooterComponent={
          hasMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#48AAD9" />
            </View>
          ) : notifications.length > PAGE_SIZE ? (
            <View className="py-4 items-center">
              <Text
                className="text-xs text-gray-400"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                No more notifications
              </Text>
            </View>
          ) : (
            <View className="h-6" />
          )
        }
      />

      <ClearNotificationsOverlay
        visible={isClearOverlayVisible}
        onClose={() => setIsClearOverlayVisible(false)}
        onConfirm={() => {
          setIsClearOverlayVisible(false);
          clearAll();
        }}
      />
    </View>
  );
}

function EmptyState({ message }) {
  return (
    <View className="items-center justify-center py-20">
      <Text
        className="text-sm text-gray-400"
        style={{ fontFamily: 'Poppins-Medium' }}
      >
        {message}
      </Text>
    </View>
  );
}

/**
 * Swipe-right-to-delete notification card.
 *
 * Accepts plain string props (message, timestamp) instead of pre-built JSX
 * to guarantee non-zero height even when message is empty.
 *
 * itemId is used to reset pan when FlatList recycles this cell for a
 * different notification item (fixes the "shifted/collapsed card" bug).
 */
function SwipeableNotificationCard({
  itemId,
  onPress,
  onSwipeDelete,
  title,
  message,
  timestamp,
  isRead,
}) {
  // Keep the Animated.Value in a ref but do NOT call .current immediately —
  // access via panValue.current everywhere so useEffect can reset it.
  const panValue = useRef(new Animated.Value(0));

  // Reset swipe position when FlatList recycles this cell for a new item.
  useEffect(() => {
    panValue.current.setValue(0);
  }, [itemId]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 15 &&
        Math.abs(gestureState.dy) < 20 &&
        gestureState.dx > 0,

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          panValue.current.setValue(gestureState.dx);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          Animated.timing(panValue.current, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onSwipeDelete());
        } else {
          Animated.spring(panValue.current, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(panValue.current, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View className="relative mt-2">
      {/* Red delete background */}
      <View className="absolute inset-0 bg-red-500 rounded-2xl flex-row items-center justify-start px-5">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Animated.timing(panValue.current, {
              toValue: 500,
              duration: 200,
              useNativeDriver: true,
            }).start(() => onSwipeDelete());
          }}
          className="flex-row items-center"
        >
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ffffff" />
          <Text
            className="text-white text-xs font-bold ml-2"
            style={{ fontFamily: 'Poppins-Bold' }}
          >
            Delete
          </Text>
        </TouchableOpacity>
      </View>

      {/* Foreground card */}
      <Animated.View
        style={{ transform: [{ translateX: panValue.current }] }}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={onPress}>
          {({ pressed }) => (
            <View
              className={`rounded-2xl p-4 border ${
                pressed
                  ? 'bg-sky-50 border-sky-200'
                  : isRead
                  ? 'bg-gray-50 border-gray-100'
                  : 'bg-white border-sky-100 shadow-sm'
              }`}
            >
              {/* Title row */}
              <View className="flex-row items-center mb-1">
                {!isRead && (
                  <View className="w-2 h-2 rounded-full bg-sky-400 mr-2 flex-shrink-0" />
                )}
                <Text
                  className={`text-sm flex-1 ${isRead ? 'text-slate-400' : 'text-slate-800'}`}
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              </View>

              {/* Message body */}
              <Text
                className="text-xs leading-5 text-slate-600"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                {message}
              </Text>

              {/* Timestamp footer */}
              <View className="flex-row items-center mt-2">
                <ClockIcon width={12} height={12} />
                <Text
                  className="text-xs ml-1 text-gray-400"
                  style={{ fontFamily: 'Poppins-Medium' }}
                >
                  {timestamp}
                </Text>
              </View>
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export default Notifications;
