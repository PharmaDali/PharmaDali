import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { colors } from '@src/shared/theme/colorPalette'
import ClockIcon from '@assets/icons/clock_icon.svg'
import { useNotifications } from '@shared/hooks/useNotifications'

const Notifications = () => {
  const router = useRouter();
  const { notifications, loading, refetch, markAsRead, markAllRead, timeAgo } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

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
    await refetch();
    setRefreshing(false);
  };

  const handleNotificationPress = async (item) => {
    if (!item.read_at) {
      await markAsRead(item.id);
    }

    if (item.type.includes('OrderPlaced') || item.type.includes('OrderStatus')) {
      router.push('/customer/tabs/orders/Orders');
    }
  };

  const getNotificationTitle = (type) => {
    if (type.includes('OrderPlaced')) return 'Order Placed';
    if (type.includes('OrderStatus')) return 'Order Status Updated';
    return 'Notification';
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 pt-6 pb-2">
        <Text className="text-2xl" style={styles.titleText}>Notifications</Text>
      </View>

      <View className="h-px bg-gray-200 mx-4 mb-2" />

      <View className="px-4 pb-6">
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.buttonColor} className="mt-10" />
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => handleNotificationPress(item)}
            >
              <NotificationCard
                isRead={!!item.read_at}
                title={getNotificationTitle(item.type)}
                description={
                  <Text className="text-xs leading-4" style={styles.text}>
                    {item.data.message}
                  </Text>
                }
                footer={
                  <View className="flex-row items-center mt-2">
                    <ClockIcon width={14} height={14} />
                    <Text className="text-xs ml-1 text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
                      {timeAgo(item.created_at)}
                    </Text>
                  </View>
                }
              />
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState message="No notifications available" />
        )}
      </View>
    </ScrollView>
  )
}

function EmptyState({ message }) {
  return (
    <View className="items-center justify-center py-20">
      <Text className="text-sm text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
        {message}
      </Text>
    </View>
  )
}

function NotificationCard({ title, description, footer, trailing, isRead }) {
  return (
    <View 
      className={`flex-row rounded-2xl p-4 mt-2 border items-center ${isRead ? 'bg-gray-50 border-gray-100' : 'bg-white border-blue-100 shadow-sm'}`}
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          {!isRead && (
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
          )}
          <Text className="text-sm" style={{ fontFamily: 'Poppins-Bold', color: colors.textColor }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4FF',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  semiBoldText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
})