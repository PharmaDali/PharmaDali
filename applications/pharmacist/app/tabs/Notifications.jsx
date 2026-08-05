import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useNotifications } from '@shared/hooks/useNotifications';

const PAGE_SIZE = 10;

const getParsedData = (data) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }
  return data;
};

const getNotificationTitle = (type) => {
  if (type?.includes('NewOrderPharmacist')) return 'New Order Received';
  if (type?.includes('OrderStatus')) return 'Order Status Updated';
  if (type?.includes('OrderCompleted')) return 'Order Completed';
  if (type?.includes('OrderExpired')) return 'Order Expired';
  if (type?.includes('OrderRejected')) return 'Order Rejected';
  return 'Notification';
};

const timeAgoUtil = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
};

export default function PharmacistNotifications() {
  const router = useRouter();
  const { notifications, loading, refetch, markAsRead, markAllRead } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  // Mark all as read when opening the screen
  React.useEffect(() => {
    if (notifications.length > 0) {
      const hasUnread = notifications.some(n => !n.read_at);
      if (hasUnread) {
        markAllRead();
      }
    }
  }, [notifications]);

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
        pathname: '/tabs/orders/Orders',
        params: {
          highlightOrderId: String(parsedData.order_id),
          orderNumber: parsedData.order_number ?? '',
        },
      });
    } else {
      router.push('/tabs/orders/Orders');
    }
  };

  const displayedNotifications = notifications.slice(0, page * PAGE_SIZE);
  const hasMore = displayedNotifications.length < notifications.length;

  const loadMore = useCallback(() => {
    if (hasMore) setPage(prev => prev + 1);
  }, [hasMore]);

  const renderItem = ({ item }) => {
    const parsedData = getParsedData(item.data);
    const isRead = !!item.read_at;

    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <View
          className={`rounded-xl p-4 mt-2 border ${
            isRead
              ? 'bg-slate-50 border-slate-200'
              : 'bg-white border-sky-200 shadow-sm'
          }`}
        >
          {/* Header row */}
          <View className="flex-row items-center mb-1">
            {!isRead && (
              <View className="w-2 h-2 rounded-full bg-sky-400 mr-2" />
            )}
            <Text
              className={`text-sm ${isRead ? 'text-slate-400' : 'text-slate-800'}`}
              style={{ fontFamily: 'Poppins-SemiBold' }}
            >
              {getNotificationTitle(item.type)}
            </Text>
          </View>

          {/* Message */}
          <Text
            className="text-slate-500 text-xs leading-5 mb-1"
            numberOfLines={2}
            style={{ fontFamily: 'Poppins-Regular' }}
          >
            {parsedData.message ?? ''}
          </Text>

          {/* Extra meta — pharmacist only */}
          {parsedData.customer_name && (
            <Text
              className="text-sky-500 text-xs mb-0.5"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Customer: {parsedData.customer_name}
            </Text>
          )}
          {parsedData.order_number && (
            <Text
              className="text-sky-500 text-xs mb-0.5"
              style={{ fontFamily: 'Poppins-Medium' }}
            >
              Order #{parsedData.order_number}
            </Text>
          )}

          {/* Timestamp */}
          <Text
            className="text-gray-400 text-xs mt-1"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {timeAgoUtil(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#48AAD9" />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
      data={displayedNotifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#48AAD9" />
      }
      ListHeaderComponent={
        <>
          <View className="pt-6 pb-2">
            <Text
              className="text-2xl text-slate-800"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              Notifications
            </Text>
          </View>
          <View className="h-px bg-slate-200 mb-2" />
        </>
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-20">
          <Text
            className="text-sm text-gray-400"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            No notifications yet
          </Text>
        </View>
      }
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
  );
}
