import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setError('');
      }
    } catch (e) {
      setError('Failed to select image.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Camera permission is required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setError('');
      }
    } catch (e) {
      setError('Failed to take photo.');
    }
  };

  const clearSelectedImage = () => setSelectedImage(null);

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
    if ((!trimmed && !selectedImage) || !conversationId) return;
    try {
      setSending(true);
      setDraft('');
      const img = selectedImage;
      setSelectedImage(null);
      await sendCustomerMessage(conversationId, trimmed || '', img);
      await loadConversation(conversationId);
    } catch (e) {
      setDraft(trimmed);
      setSelectedImage(selectedImage);
      setError(e?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }, [conversationId, draft, selectedImage, loadConversation]);

  const grouped = useMemo(() => groupMessagesByDate(messages), [messages]);

  const renderItem = ({ item }) => {
    if (item._type === 'separator') {
      return (
        <View className="flex-row items-center my-3.5">
          <View className="flex-1 h-px bg-slate-200" />
          <Text style={s.dateLabel} className="mx-2.5">{item.label}</Text>
          <View className="flex-1 h-px bg-slate-200" />
        </View>
      );
    }

    if (item.message_type === 'system') {
      return (
        <View className="items-center my-2">
          <View className="bg-slate-100 rounded-full px-3.5 py-1">
            <Text style={s.systemText}>{item.body}</Text>
          </View>
        </View>
      );
    }

    const isMine = item?.sender_user_id === currentUserId;

    return (
      <View className={`flex-row mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <View className="h-[30px] w-[30px] rounded-full bg-sky-100 items-center justify-center mr-2 self-end">
            <Text style={s.partnerAvatarText}>{getInitials(partnerName)}</Text>
          </View>
        )}
        <View className="max-w-[76%]">
          {!isMine && <Text style={s.senderLabel} className="mb-0.5 ml-1">{partnerName}</Text>}
          <View
            style={[
              isMine ? s.mineBubble : s.theirsBubble,
              (item?.message_type === 'image' || item?.metadata?.image_url) && { padding: 4, borderRadius: 12 },
            ]}
            className="rounded-[18px] px-3.5 py-2"
          >
            {(item?.message_type === 'image' || item?.metadata?.image_url) && item?.metadata?.image_url ? (
              <Image
                source={{ uri: item.metadata.image_url }}
                style={{ width: 200, height: 200, borderRadius: 8, marginBottom: item?.body ? 4 : 0 }}
                resizeMode="cover"
              />
            ) : null}
            {!!item?.body && (
              <Text
                style={[
                  s.messageText,
                  isMine ? s.mineText : s.theirsText,
                  (item?.message_type === 'image' || item?.metadata?.image_url) && { paddingHorizontal: 8, paddingVertical: 4 },
                ]}
              >
                {item?.body}
              </Text>
            )}
            <View className={`flex-row items-center mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
              <Text style={[s.timeText, isMine ? s.mineTime : s.theirsTime]}>
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
      <View className="flex-1 items-center justify-center bg-slate-50" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={colors.buttonColor} />
        <Text style={s.stateText} className="mt-2.5">Opening chat...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* ── Header ── */}
      <View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[s.header, { paddingTop: insets.top + 10 }]}
        className="px-4 pb-4"
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-2 h-[38px] w-[38px] rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </Pressable>

          <View
            className="h-10 w-10 rounded-full items-center justify-center mr-2.5 border-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.4)' }}
          >
            <Text style={s.headerAvatarText}>{getInitials(partnerName)}</Text>
          </View>

          <View className="flex-1">
            <Text style={s.headerName} numberOfLines={1}>{partnerName}</Text>
            <View className="flex-row items-center mt-px">
              <View className="h-[7px] w-[7px] rounded-full bg-emerald-400 mr-1.5" />
              <Text style={s.headerSub} numberOfLines={1}>
                {conversation?.pharmacy?.pharmacy_name || 'Pharmacy'}
              </Text>
            </View>
          </View>

          {conversation?.order?.order_number && (
            <View
              className="rounded-full px-2.5 py-1 ml-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text style={s.orderBadgeText}>
                #{conversation.order.order_number.split('-').pop()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Scrollable area + input ── */}
      <View style={{ flex: 1, marginBottom: keyboardHeight > 0 ? keyboardHeight + 50 : 0 }}>
        {!!error && (
          <View className="flex-row items-center bg-red-50 mx-4 mt-2.5 rounded-xl px-3 py-2">
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={s.errorText} className="flex-1 ml-1.5">{error}</Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={grouped}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-12 px-8">
              <View className="h-[68px] w-[68px] rounded-full bg-sky-100 items-center justify-center mb-3.5">
                <MaterialCommunityIcons name="message-text-outline" size={34} color={colors.buttonColor} />
              </View>
              <Text style={s.emptyTitle} className="mb-1">Start the conversation</Text>
              <Text style={s.emptySubtitle} className="text-center">Your pharmacist is ready to help.</Text>
            </View>
          }
        />

        {selectedImage && (
          <View className="bg-white border-t border-slate-200 px-4 pt-3 pb-1">
            <View className="w-20 h-20 relative">
              <Image source={{ uri: selectedImage.uri }} className="w-20 h-20 rounded-lg" />
              <TouchableOpacity
                onPress={clearSelectedImage}
                className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          className="flex-row items-end bg-white border-t border-slate-200 px-3 pt-2"
          style={{ paddingBottom: keyboardHeight > 0 ? 10 : insets.bottom + 20 }}
        >
          <TouchableOpacity onPress={pickFromGallery} className="h-11 w-9 items-center justify-center mb-0.5 mr-1" activeOpacity={0.7}>
            <MaterialCommunityIcons name="image-outline" size={24} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={takePhoto} className="h-11 w-9 items-center justify-center mb-0.5 mr-1" activeOpacity={0.7}>
            <MaterialCommunityIcons name="camera-outline" size={24} color="#64748B" />
          </TouchableOpacity>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            style={s.input}
            multiline
            blurOnSubmit={false}
          />
          <Pressable
            onPress={handleSend}
            disabled={(!draft.trim() && !selectedImage) || sending}
            className="h-11 w-11 rounded-full items-center justify-center mb-0.5"
            style={[{ backgroundColor: colors.buttonColor }, ((!draft.trim() && !selectedImage) || sending) && { opacity: 0.45 }]}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <MaterialCommunityIcons name="send" size={20} color="#fff" />
            }
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // ── Fonts & colors only ──
  stateText: {
     fontFamily: 'Poppins-Medium', 
     color: '#64748B', 
     fontSize: 14 
  },
  header: { 
    backgroundColor: colors.buttonColor,
     borderBottomLeftRadius: 20, 
     borderBottomRightRadius: 20, 
     elevation: 4, 
     shadowColor: '#000', 
     shadowOffset: { width: 0, height: 2 }, 
     shadowOpacity: 0.12, 
     shadowRadius: 8 
  },
  headerAvatarText: { 
    fontFamily: 'Poppins-Bold', 
    color: '#fff', 
    fontSize: 14 
  },
  headerName: {
     fontFamily: 'Poppins-Bold', 
     color: '#fff', 
     fontSize: 16
     },
  headerSub: {
     fontFamily: 'Poppins-Medium', 
     color: 'rgba(255,255,255,0.85)', 
     fontSize: 12
     },
  orderBadgeText: {
     fontFamily: 'Poppins-SemiBold', 
     color: '#fff', 
     fontSize: 11
     },
  dateLabel: {
     fontFamily: 'Poppins-SemiBold',
     fontSize: 11,
     color: '#94A3B8' 
    },
  systemText: {
     fontFamily: 'Poppins-Medium', 
     fontSize: 11, 
     color: '#64748B' 
    },
  partnerAvatarText: {
     fontFamily: 'Poppins-Bold',
      fontSize: 10, 
      color: colors.buttonColor 
    },
  senderLabel: {
     fontFamily: 'Poppins-SemiBold', 
     fontSize: 11, 
     color: colors.buttonColor 
    },
  mineBubble: { 
    backgroundColor: colors.buttonColor, 
    borderBottomRightRadius: 4 
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
    shadowRadius: 3 
  },
  messageText: { 
    fontFamily: 'Poppins-Medium', 
    fontSize: 14, 
    lineHeight: 20 
  },
  mineText: { 
    color: '#fff' 
  },
  theirsText: {
     color: '#1E293B' 
    },
  timeText: { 
    fontFamily: 'Poppins-Medium', 
    fontSize: 10 
  },
  mineTime: { 
    color: 'rgba(255,255,255,0.65)' 
  },
  theirsTime: {
     color: '#94A3B8' 
    },
  emptyTitle: {
     fontFamily: 'Poppins-Bold', 
     color: '#1E293B', 
     fontSize: 17 
    },
  emptySubtitle: { 
    fontFamily: 'Poppins-Medium', 
    color: '#64748B', 
    fontSize: 13 
  },
  errorText: { 
    fontFamily: 'Poppins-Medium', 
    color: '#DC2626', 
    fontSize: 12 
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
    marginRight: 8 
  },
});
