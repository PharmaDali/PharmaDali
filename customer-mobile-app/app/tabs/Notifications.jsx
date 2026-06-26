import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import ClockIcon from '@assets/icons/clock_icon.svg'
import { useNotifications } from '@shared/hooks/useNotifications'

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
  const { notifications, loading, refetch, markAsRead, markAllRead, timeAgo } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    // When the user opens this screen, mark all as read to clear the badge
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
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <NotificationCard
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
                {timeAgo(item.created_at)}
              </Text>
            </View>
          }
        />
      </TouchableOpacity>
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#48AAD9" />
      }
      ListHeaderComponent={
        <>
          <View className="px-0 pt-6 pb-2">
            <Text
              className="text-2xl text-slate-800"
              style={{ fontFamily: 'Poppins-Bold' }}
            >
              Notifications
            </Text>
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
  )
}

function NotificationCard({ title, description, footer, trailing, isRead }) {
  return (
    <View
      className={`rounded-2xl p-4 mt-2 border ${
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
  )
}

export default Notifications
