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
import MainLogo from '@src/shared/components/MainLogo';
import {
  getPharmacistChatContacts,
  getPharmacistConversations,
  startPharmacistConversation,
} from '@shared/services/chatService';

const getParticipantName = (person) => {
  const firstName = person?.first_name || person?.user?.first_name || '';
  const lastName = person?.last_name || person?.user?.last_name || '';
  return `${firstName} ${lastName}`.trim() || 'Conversation';
};

const getConversationPartner = (conversation) => conversation?.customer ?? null;

export default function PharmacistChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [contactsResult, conversationsResult] = await Promise.all([
        getPharmacistChatContacts(),
        getPharmacistConversations(),
      ]);

      setContacts(Array.isArray(contactsResult) ? contactsResult : []);
      setConversations(Array.isArray(conversationsResult) ? conversationsResult : []);
    } catch (e) {
      setError(e?.message || 'Failed to load chat data.');
      setContacts([]);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const openConversation = useCallback(async (contact) => {
    if (!contact?.id) return;

    try {
      setBusyId(contact.id);
      const conversation = await startPharmacistConversation(contact.id);
      const conversationId = conversation?.id;

      if (conversationId) {
        router.push({
          pathname: '/tabs/chat/Conversation',
          params: { conversationId: String(conversationId) },
        });
      }
    } catch (e) {
      setError(e?.message || 'Could not open the conversation.');
    } finally {
      setBusyId(null);
    }
  }, [router]);

  const recentConversations = useMemo(() => conversations.slice(0, 8), [conversations]);

  const renderConversation = ({ item }) => {
    const partner = getConversationPartner(item);
    const latest = item?.latest_message?.body || 'No messages yet.';

    return (
      <Pressable
        onPress={() => router.push({ pathname: '/tabs/chat/Conversation', params: { conversationId: String(item.id) } })}
        className="flex-row items-center py-3"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Text style={styles.avatarText}>{getParticipantName(partner).charAt(0)}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text style={styles.cardTitle}>{getParticipantName(partner)}</Text>
          <Text className="mt-1" style={styles.cardSubtitle} numberOfLines={1}>{latest}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
      </Pressable>
    );
  };

  const renderContact = ({ item }) => {
    const isBusy = busyId === item.id;

    return (
      <Pressable onPress={() => openConversation(item)} className="flex-row items-center py-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
          <Text style={styles.contactAvatarText}>{getParticipantName(item).charAt(0)}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text style={styles.contactName}>{getParticipantName(item)}</Text>
          <Text className="mt-1" style={styles.contactMeta} numberOfLines={1}>
            {item?.customer?.user?.mobile_number ? `Mobile ${item.customer.user.mobile_number}` : 'Customer in your branch'}
          </Text>
        </View>
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.buttonColor} />
        ) : (
          <MaterialCommunityIcons name="chat-outline" size={22} color={colors.buttonColor} />
        )}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-sky-50">
      <View className="rounded-b-[28px] bg-sky-500 px-5 pb-4" style={{ paddingTop: insets.top + 12 }}>
        <MainLogo />
        <Text style={styles.headerTitle}>Messages</Text>
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
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        >
          {!!error && <Text className="mt-4" style={styles.errorText}>{error}</Text>}

          <View className="mt-4 rounded-[24px] bg-white p-4 shadow-lg shadow-slate-900/10">
            <View className="mb-3 flex-row items-center justify-between">
              <Text style={styles.sectionTitle}>Recent chats</Text>
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
                <Text style={styles.emptyText}>No conversations yet.</Text>
              </View>
            )}
          </View>

          <View className="mt-4 rounded-[24px] bg-white p-4 shadow-lg shadow-slate-900/10">
            <View className="mb-3 flex-row items-center justify-between">
              <Text style={styles.sectionTitle}>Customers in your branch</Text>
              <Text style={styles.sectionCount}>{contacts.length}</Text>
            </View>
            {contacts.length > 0 ? (
              <FlatList
                data={contacts}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderContact}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
              />
            ) : (
              <View className="items-center justify-center rounded-2xl bg-slate-50 py-6">
                <MaterialCommunityIcons name="account-group-outline" size={26} color="#94A3B8" />
                <Text style={styles.emptyText}>No customers available for your branch.</Text>
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
  emptyText: {
    marginTop: 8,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  contactAvatarText: {
    fontFamily: 'Poppins-Bold',
    color: '#0284C7',
    fontSize: 18,
  },
  contactName: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
    fontSize: 15,
  },
  contactMeta: {
    marginTop: 3,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
});
