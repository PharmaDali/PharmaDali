import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Animated, PanResponder } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import { useRouter } from 'expo-router'
import ClockIcon from '@assets/icons/clock_icon.svg'
import { useNotifications } from '@shared/hooks/useNotifications'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import ClearNotificationsOverlay from '@shared/components/ClearNotificationsOverlay'

const PAGE_SIZE = 10;

const getParsedData = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse notification data:', e);
      return {};
    }
  }
  return data;
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

  const handleClearAll = () => {
    setIsClearOverlayVisible(true);
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

    if (
      item.type.includes('OrderCompleted') ||
      item.type.includes('OrderExpired') ||
      item.type.includes('OrderRejected')
    ) {
      router.push({
        pathname: '/tabs/orders/Orders',
        params: { tab: 'completed' },
      });
      return;
    }

    if (item.type.includes('OrderPlaced') || item.type.includes('OrderStatus')) {
      router.push('/tabs/orders/Orders');
    }
  };

  const getNotificationTitle = (type) => {
    if (type.includes('OrderPlaced')) return 'Order Placed';
    if (type.includes('OrderStatus')) return 'Order Status Updated';
    if (type.includes('OrderCompleted')) return 'Order Completed';
    if (type.includes('OrderExpired')) return 'Order Expired';
    if (type.includes('OrderRejected')) return 'Order Rejected';
    return 'Notification';
  };

  const displayedNotifications = notifications.slice(0, page * PAGE_SIZE);
  const hasMore = displayedNotifications.length < notifications.length;

  const loadMore = useCallback(() => {
    if (hasMore) setPage(prev => prev + 1);
  }, [hasMore]);

  const renderItem = ({ item }) => {
    const parsedData = getParsedData(item.data);
    return (
      <SwipeableNotificationCard
        onSwipeDelete={() => removeNotification(item.id)}
        onPress={() => handleNotificationPress(item)}
        isRead={!!item.read_at}
        title={getNotificationTitle(item.type)}
        description={
          <Text
            className="text-xs leading-4 text-slate-600"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {parsedData.message}
          </Text>
        }
        footer={
          <View className="flex-row items-center mt-2">
            <ClockIcon width={14} height={14} />
            <Text
              className="text-xs ml-1 text-gray-400"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              {timeAgo(item.created_at || item.dateTime)}
            </Text>
          </View>
        }
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
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
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
                  onPress={handleClearAll}
                  className="flex-row items-center px-3 py-1.5 rounded-full bg-red-50 active:bg-red-100"
                >
                  <MaterialCommunityIcons name="delete-sweep-outline" size={18} color="#EF4444" />
                  <Text
                    className="text-xs font-semibold text-red-500 ml-1"
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
 * Slide-to-right to delete component
 */
function SwipeableNotificationCard({ onPress, onSwipeDelete, title, description, footer, trailing, isRead }) {
  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only set pan responder if horizontal swipe to right is intention
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 20 && gestureState.dx > 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow dragging to the right (positive dx)
        if (gestureState.dx > 0) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped right past 100px threshold, trigger delete animation and callback
        if (gestureState.dx > 100) {
          Animated.timing(pan, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onSwipeDelete();
          });
        } else {
          // Otherwise spring back to original position
          Animated.spring(pan, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View className="relative mt-2">
      {/* Background delete action container (visible under swiped card) */}
      <View className="absolute inset-0 bg-red-500 rounded-2xl flex-row items-center justify-start px-5 shadow-sm">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Animated.timing(pan, {
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

      {/* Foreground notification card (swipes right) */}
      <Animated.View
        style={{
          transform: [{ translateX: pan }],
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <View
            className={`rounded-2xl p-4 border ${
              isRead
                ? 'bg-gray-50 border-gray-100'
                : 'bg-white border-sky-100 shadow-sm'
            }`}
          >
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                {!isRead && (
                  <View className="w-2 h-2 rounded-full bg-sky-400 mr-2" />
                )}
                <Text
                  className={`text-sm ${isRead ? 'text-slate-400' : 'text-slate-800'}`}
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  {title}
                </Text>
              </View>
              {description}
              {footer}
            </View>
            {trailing && (
              <View className="ml-2">
                {trailing}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default Notifications;

