import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@src/shared/theme/colorPalette';
import MainLogo from '@shared/components/MainLogo';
import {
  getCustomerConversations,
} from '@shared/services/chatService';

const formatStatus = (status) => {
  if (!status) return 'Open';
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
      const conversationsResult = await getCustomerConversations();
      setConversations(Array.isArray(conversationsResult) ? conversationsResult : []);
    } catch (e) {
      setError(e?.message || 'Failed to load chat data.');
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      if (mounted) {
        setLoading(true);
      }

      loadData();

      return () => {
        mounted = false;
      };
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const recentConversations = useMemo(() => conversations.slice(0, 8), [conversations]);

  const renderConversation = ({ item }) => {
    const order = item?.order;
    const orderNumber = order?.order_number || order?.id || item?.order_id;
    const latest = item?.latest_message?.body || 'No messages yet.';
    const branchName = item?.pharmacy?.branch_name || 'Pharmacy';
    const statusLabel = formatStatus(order?.status || item?.status);

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/tabs/chat/Conversation', params: { conversationId: String(item.id) } })}
        className="flex-row items-center py-3"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-sky-100">
          <Text style={styles.avatarText}>#</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text style={styles.cardTitle}>Order #{orderNumber}</Text>
          <Text className="mt-1" style={styles.cardSubtitle} numberOfLines={1}>
            {branchName} • {statusLabel}
          </Text>
          <Text className="mt-1" style={styles.messagePreview} numberOfLines={1}>
            {latest}
          </Text>
        </View>
        <View className="mr-2 rounded-full bg-sky-50 px-2.5 py-1">
          <Text style={styles.threadBadge}>{statusLabel}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-sky-50">
      <View className="rounded-b-[28px] bg-sky-500 px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <MainLogo />
        <Text style={styles.headerTitle}>Order Chats</Text>
        <Text className="mt-1" style={styles.headerSubtitle}>Live threads tied to each order</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center px-5">
          <ActivityIndicator size="large" color={colors.buttonColor} />
          <Text style={styles.stateText}>Loading chats...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96, paddingHorizontal: 16 }}
        >
          {!!error && <Text className="mt-4" style={styles.errorText}>{error}</Text>}

          <View className="mt-4 rounded-[24px] bg-white p-4 shadow-lg shadow-slate-900/10">
            <View className="mb-3 flex-row items-center justify-between">
              <Text style={styles.sectionTitle}>Recent order threads</Text>
              <Text style={styles.sectionCount}>{recentConversations.length}</Text>
            </View>
            {recentConversations.length > 0 ? (
              <FlatList
                data={recentConversations}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderConversation}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
              />
            ) : (
              <View className="items-center justify-center rounded-2xl bg-slate-50 py-6">
                <MaterialCommunityIcons name="message-text-outline" size={26} color="#94A3B8" />
                <Text style={styles.emptyText}>No order chats yet.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    marginTop: 12,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 28,
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.85)',
  },
  stateText: {
    marginTop: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins-Medium',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
    fontSize: 17,
  },
  sectionCount: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
  cardTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
    fontSize: 15,
  },
  cardSubtitle: {
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    marginTop: 3,
  },
  avatarText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
    fontSize: 18,
  },
  threadBadge: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
    fontSize: 11,
  },
  emptyText: {
    marginTop: 8,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  messagePreview: {
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    fontSize: 13,
  },
  contactMeta: {
    marginTop: 3,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
});
