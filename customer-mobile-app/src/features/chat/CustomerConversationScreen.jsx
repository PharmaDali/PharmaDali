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
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const formatDateLabel = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const groupMessagesByDate = (messages) => {
  const grouped = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const dateLabel = formatDateLabel(msg.created_at);
    if (dateLabel && dateLabel !== lastDate) {
      grouped.push({ _type: 'separator', id: `sep-${msg.id}`, label: dateLabel });
      lastDate = dateLabel;
    }
    grouped.push({ ...msg, _type: 'message' });
  });
  return grouped;
};

export default function CustomerConversationScreen() {
  // Guard: Expo Router v6 may not have params ready on first render
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const conversationId = params?.conversationId ?? null;

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [headerHeight, setHeaderHeight] = useState(0);

  const conversationPartner = useMemo(() => {
    if (!conversation) return null;
    if (conversation.customer_user_id === currentUserId) return conversation.pharmacist;
    return conversation.customer;
  }, [conversation, currentUserId]);

  const partnerName = conversationPartner
    ? `${conversationPartner.first_name || ''} ${conversationPartner.last_name || ''}`.trim()
    : 'Pharmacist';

  const loadProfile = useCallback(async () => {
    try {
      const payload = await getCustomerProfile();
      return payload?.data?.user?.id ?? payload?.data?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  const loadConversation = useCallback(async (id) => {
    if (!id) return;
    try {
      setError('');
      const payload = await getCustomerConversation(id);
      setConversation(payload?.conversation ?? null);
      setMessages(payload?.messages?.data ?? []);
    } catch (e) {
      setError(e?.message || 'Failed to load conversation.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Plain mount-only effect — no navigation hooks
  useEffect(() => {
    let cancelled = false;
    let interval = null;

    const init = async () => {
      if (cancelled) return;
      const userId = await loadProfile();
      if (!cancelled) setCurrentUserId(userId);
    };

    const refresh = async () => {
      if (cancelled) return;
      await loadConversation(conversationId);
    };

    setLoading(true);
    init().then(() => {
      if (!cancelled) {
        refresh();
        interval = setInterval(refresh, 6000);
      }
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || !conversationId) return;
    try {
      setSending(true);
      setDraft('');
      await sendCustomerMessage(conversationId, trimmed);
      await loadConversation(conversationId);
    } catch (e) {
      setDraft(trimmed);
      setError(e?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }, [conversationId, draft, loadConversation]);

  const grouped = useMemo(() => groupMessagesByDate(messages), [messages]);

  const renderItem = ({ item }) => {
    if (item._type === 'separator') {
      return (
        <View style={styles.dateSepRow}>
          <View style={styles.dateSepLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateSepLine} />
        </View>
      );
    }

    if (item.message_type === 'system') {
      return (
        <View style={styles.systemRow}>
          <View style={styles.systemPill}>
            <Text style={styles.systemText}>{item.body}</Text>
          </View>
        </View>
      );
    }

    const isMine = item?.sender_user_id === currentUserId;

    return (
      <View style={[styles.messageRow, isMine ? styles.rowMine : styles.rowTheirs]}>
        {!isMine && (
          <View style={styles.partnerAvatar}>
            <Text style={styles.partnerAvatarText}>{getInitials(partnerName)}</Text>
          </View>
        )}
        <View style={styles.bubbleWrapper}>
          {!isMine && <Text style={styles.senderLabel}>{partnerName}</Text>}
          <View style={[styles.bubble, isMine ? styles.mineBubble : styles.theirsBubble]}>
            <Text style={[styles.messageText, isMine ? styles.mineText : styles.theirsText]}>
              {item?.body}
            </Text>
            <View style={[styles.timeRow, isMine ? styles.timeRowMine : styles.timeRowTheirs]}>
              <Text style={[styles.timeText, isMine ? styles.mineTime : styles.theirsTime]}>
                {formatTime(item?.created_at)}
              </Text>
              {isMine && (
                <MaterialCommunityIcons name="check-all" size={12} color="rgba(255,255,255,0.65)" style={{ marginLeft: 2 }} />
              )}
            </View>
          </View>
        </View>
        {!isMine && <View style={{ width: 36 }} />}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerState, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.buttonColor} />
        <Text style={styles.stateText}>Opening chat...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* ── Header (outside KAV) ── */}
      <View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </Pressable>

          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{getInitials(partnerName)}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{partnerName}</Text>
            <View style={styles.headerSubRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSub} numberOfLines={1}>
                {conversation?.pharmacy?.branch_name || 'Pharmacy'}
              </Text>
            </View>
          </View>

          {conversation?.order?.order_number && (
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>
                #{conversation.order.order_number.split('-').pop()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── KAV wraps only the scrollable area + input ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        {!!error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={grouped}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="message-text-outline" size={34} color={colors.buttonColor} />
              </View>
              <Text style={styles.emptyTitle}>Start the conversation</Text>
              <Text style={styles.emptySubtitle}>
                Your pharmacist is ready to help.
              </Text>
            </View>
          }
        />

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            multiline
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || sending}
            style={[styles.sendBtn, (!draft.trim() || sending) && { opacity: 0.45 }]}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <MaterialCommunityIcons name="send" size={20} color="#fff" />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  stateText: {
    marginTop: 10,
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    fontSize: 14,
  },
  header: {
    backgroundColor: colors.buttonColor,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 8,
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerAvatarText: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 14,
  },
  headerName: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 16,
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  onlineDot: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginRight: 5,
  },
  headerSub: {
    fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  orderBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  orderBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    fontSize: 11,
  },
  // Messages
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubbleWrapper: { maxWidth: '76%' },
  partnerAvatar: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  partnerAvatarText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: colors.buttonColor,
  },
  senderLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: colors.buttonColor,
    marginBottom: 3,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  mineBubble: {
    backgroundColor: colors.buttonColor,
    borderBottomRightRadius: 4,
  },
  theirsBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  messageText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  mineText: { color: '#fff' },
  theirsText: { color: '#1E293B' },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  timeRowMine: { justifyContent: 'flex-end' },
  timeRowTheirs: { justifyContent: 'flex-start' },
  timeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
  },
  mineTime: { color: 'rgba(255,255,255,0.65)' },
  theirsTime: { color: '#94A3B8' },
  dateSepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dateSepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dateLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    marginHorizontal: 10,
  },
  systemRow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  systemText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#64748B',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    height: 68,
    width: 68,
    borderRadius: 34,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#1E293B',
    fontSize: 17,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'Poppins-Medium',
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#1E293B',
    marginRight: 8,
  },
  sendBtn: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: colors.buttonColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    color: '#DC2626',
    fontSize: 12,
    flex: 1,
    marginLeft: 6,
  },
});
