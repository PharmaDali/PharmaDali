import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@src/shared/theme/colorPalette';
import {
  getCustomerConversation,
  sendCustomerMessage,
} from '@shared/services/chatService';
import { getCustomerProfile } from '@shared/services/customerProfileService';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function CustomerConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { conversationId } = useLocalSearchParams();
  const flatListRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const conversationPartner = useMemo(() => {
    if (!conversation) return null;
    if (conversation.customer_user_id === currentUserId) {
      return conversation.pharmacist;
    }

    return conversation.customer;
  }, [conversation, currentUserId]);

  const loadProfile = useCallback(async () => {
    const payload = await getCustomerProfile();
    return payload?.data?.user?.id ?? payload?.data?.id ?? null;
  }, []);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      setError('');
      const payload = await getCustomerConversation(conversationId);
      setConversation(payload?.conversation ?? null);
      setMessages(payload?.messages?.data ?? []);
    } catch (e) {
      setError(e?.message || 'Failed to load the conversation.');
      setConversation(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const loadAll = useCallback(async () => {
    try {
      const userId = await loadProfile();
      setCurrentUserId(userId);
    } catch {
      setCurrentUserId(null);
    }

    await loadConversation();
  }, [loadConversation, loadProfile]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);

      const refresh = async () => {
        if (!cancelled) {
          await loadAll();
        }
      };

      refresh();
      const interval = setInterval(refresh, 6000);

      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }, [loadAll]),
  );

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || !conversationId) return;

    try {
      setSending(true);
      setDraft('');
      await sendCustomerMessage(conversationId, trimmed);
      await loadConversation();
    } catch (e) {
      setDraft(trimmed);
      setError(e?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }, [conversationId, draft, loadConversation]);

  const renderMessage = ({ item }) => {
    const isMine = item?.sender_user_id === currentUserId;

    return (
      <View style={[styles.messageRow, isMine ? styles.messageRowMine : styles.messageRowTheirs]}>
        <View style={[styles.bubble, isMine ? styles.mineBubble : styles.theirsBubble]}>
          <Text style={[styles.messageText, isMine ? styles.mineText : styles.theirsText]}>
            {item?.body}
          </Text>
          <Text style={[styles.timeText, isMine ? styles.mineTime : styles.theirsTime]}>
            {formatTime(item?.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-sky-50">
        <ActivityIndicator size="large" color={colors.buttonColor} />
        <Text style={styles.stateText}>Opening chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-sky-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View className="flex-row items-center rounded-b-[28px] bg-sky-500 px-4 pb-4" style={{ paddingTop: insets.top + 10 }}>
        <Pressable onPress={() => router.back()} className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <MaterialCommunityIcons name="chevron-left" size={30} color="#fff" />
        </Pressable>
        <View className="flex-1">
          <Text style={styles.headerTitle} numberOfLines={1}>
            {conversationPartner ? `${conversationPartner.first_name || ''} ${conversationPartner.last_name || ''}`.trim() : 'Chat'}
          </Text>
          <Text className="mt-0.5" style={styles.headerSubtitle} numberOfLines={1}>
            {conversation?.branch?.branch_name || 'Pharmacy conversation'}
          </Text>
        </View>
      </View>

      <View className="flex-1">
        {!!error && <Text className="mx-4 mt-3" style={styles.errorText}>{error}</Text>}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <MaterialCommunityIcons name="message-outline" size={34} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text className="mt-1 px-7 text-center" style={styles.emptySubtitle}>Send a message to your pharmacist and get live support.</Text>
            </View>
          }
        />

        <View className="flex-row items-end border-t border-slate-200 bg-white px-3 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            className="mr-2 min-h-[48px] max-h-[120px] flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3"
            style={styles.input}
            multiline
          />
          <Pressable onPress={handleSend} className={`mb-[2px] h-12 w-12 items-center justify-center rounded-full ${sending ? 'opacity-70' : ''}`} style={{ backgroundColor: colors.buttonColor }}>
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" size={22} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 20,
  },
  headerSubtitle: {
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins-Medium',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mineBubble: {
    backgroundColor: colors.buttonColor,
    borderBottomRightRadius: 6,
  },
  theirsBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  mineText: {
    color: '#fff',
  },
  theirsText: {
    color: colors.textColor,
  },
  timeText: {
    marginTop: 6,
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
  },
  mineTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  theirsTime: {
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    marginTop: 10,
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
    fontSize: 17,
  },
  emptySubtitle: {
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
  input: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  stateText: {
    marginTop: 12,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
  },
});
