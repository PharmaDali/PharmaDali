import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@src/shared/theme/colorPalette';
import { getCustomerConversations } from '@shared/services/chatService';

const ORDER_STATUS_COLORS = {
  pending:          '#F59E0B',  
  reviewing:        '#3B82F6',  
  preparing:        '#8B5CF6',  
  stand_by:         '#F97316',  
  ready_for_pickup: '#10B981',  
  completed:        '#64748B',  
  cancelled:        '#EF4444',  
};

const ORDER_STATUS_LABELS = {
  pending:          'Pending',
  reviewing:        'Reviewing',
  preparing:        'Preparing',
  stand_by:         'On Hold',
  ready_for_pickup: 'Ready for Pickup',
  completed:        'Completed',
  cancelled:        'Cancelled',
};

const CONV_STATUS_COLORS = {
  open:   '#10B981',
  closed: '#94A3B8',
};

const CONV_STATUS_LABELS = {
  open:   'Open',
  closed: 'Closed',
};

const getStatusColor = (orderStatus, convStatus) => {
  if (orderStatus) {
    return ORDER_STATUS_COLORS[String(orderStatus).toLowerCase()] ?? '#94A3B8';
  }
  return CONV_STATUS_COLORS[String(convStatus || 'open').toLowerCase()] ?? '#10B981';
};

const getStatusLabel = (orderStatus, convStatus) => {
  if (orderStatus) {
    return ORDER_STATUS_LABELS[String(orderStatus).toLowerCase()] ?? String(orderStatus);
  }
  return CONV_STATUS_LABELS[String(convStatus || 'open').toLowerCase()] ?? 'Open';
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export default function CustomerChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const result = await getCustomerConversations();
      setConversations(Array.isArray(result) ? result : []);
    } catch (e) {
      setError(e?.message || 'Failed to load chats.');
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderItem = ({ item }) => {
    const order = item?.order;
    const orderNumber = order?.order_number || order?.id || item?.order_id || '—';
    const shortOrderNum = String(orderNumber).split('-').pop();
    const branchName = item?.pharmacy?.branch_name || 'Pharmacy';
    const latest = item?.latest_message?.body || '';
    const relTime = formatRelativeTime(item?.latest_message?.created_at || item?.updated_at);
    const orderStatus = order?.status ?? null;
    const convStatus  = item?.status ?? null;
    const statusColor = getStatusColor(orderStatus, convStatus);
    const statusLabel = getStatusLabel(orderStatus, convStatus);
    const hasUnread = item?.unread_count > 0;

    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/tabs/chat/Conversation',
          params: { conversationId: String(item.id) },
        })}
        className="flex-row items-center px-4 py-3"
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View className="h-[52px] w-[52px] rounded-full bg-sky-100 items-center justify-center mr-3 relative">
          <Text className="text-[17px]" style={{ fontFamily: 'Poppins-Bold', color: colors.buttonColor }}>
            {getInitials(branchName)}
          </Text>
          <View
            className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white"
            style={{ backgroundColor: statusColor }}
          />
        </View>

        {/* Content */}
        <View className="flex-1 mr-1.5">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text
              className="text-[15px] text-slate-900 flex-1 mr-1.5"
              style={{ fontFamily: hasUnread ? 'Poppins-Bold' : 'Poppins-SemiBold' }}
              numberOfLines={1}
            >
              {branchName}
            </Text>
            <Text className="text-xs text-slate-400" style={{ fontFamily: 'Poppins-Medium' }}>
              {relTime}
            </Text>
          </View>
          <Text className="text-xs text-slate-500 mb-0.5" style={{ fontFamily: 'Poppins-Medium' }} numberOfLines={1}>
            Order #{shortOrderNum} · {statusLabel}
          </Text>
          {!!latest && (
            <Text
              className={`text-[13px] ${hasUnread ? 'text-slate-800' : 'text-slate-400'}`}
              style={{ fontFamily: hasUnread ? 'Poppins-SemiBold' : 'Poppins-Medium' }}
              numberOfLines={1}
            >
              {latest}
            </Text>
          )}
        </View>

        {/* Unread badge */}
        {hasUnread && (
          <View className="items-center justify-center ml-1">
            <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.buttonColor }} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* ── Header ── */}
      <View
        className="flex-row items-center px-5 pb-5"
        style={{
          backgroundColor: colors.buttonColor,
          paddingTop: insets.top + 12,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-2xl text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
          Chats
        </Text>
      </View>

      {/* ── Body ── */}
      {loading ? (
        <View className="flex-grow items-center justify-center pt-12 px-8">
          <ActivityIndicator size="large" color={colors.buttonColor} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.buttonColor}
            />
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          contentContainerStyle={
            conversations.length === 0
              ? { flexGrow: 1, justifyContent: 'center' }
              : { paddingBottom: insets.bottom + 96 }
          }
          ListEmptyComponent={
            error ? (
              <View className="flex-grow items-center justify-center pt-12 px-8">
                <Text className="text-[13px] text-red-600 text-center" style={{ fontFamily: 'Poppins-Medium' }}>
                  {error}
                </Text>
              </View>
            ) : (
              <View className="flex-grow items-center justify-center pt-12 px-8">
                <MaterialCommunityIcons name="message-text-outline" size={40} color="#CBD5E1" />
                <Text className="text-base text-slate-800 mt-3 mb-1" style={{ fontFamily: 'Poppins-Bold' }}>
                  No conversations yet
                </Text>
                <Text className="text-[13px] text-slate-400 text-center" style={{ fontFamily: 'Poppins-Medium' }}>
                  Your order chats will appear here.
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
