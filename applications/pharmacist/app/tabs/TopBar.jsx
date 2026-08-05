import { View, TouchableOpacity, Text } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MainLogo from '@src/shared/components/MainLogo'
import NotificationIcon from '@assets/icons/notification_icon.svg'
import ChatIcon from '@assets/icons/chat_icon.svg'
import { useRouter } from 'expo-router'
import { useUnreadNotifications } from '@shared/hooks/useUnreadNotifications'

const TopBar = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { unreadCount } = useUnreadNotifications()

  return (
    <View className="bg-sky-500" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-2">

        {/* Left — Notification Bell */}
        <TouchableOpacity
          onPress={() => router.push('/tabs/Notifications')}
          className="p-2"
          style={{ position: 'relative' }}
        >
          <NotificationIcon width={28} height={28} />
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: '#EF4444',
              borderRadius: 8,
              minWidth: 16,
              height: 16,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3,
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Poppins-Bold' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Center — Logo */}
        <MainLogo />

        {/* Right — Chat */}
        <TouchableOpacity onPress={() => router.push('/tabs/chat/Chat')} className="p-2">
          <ChatIcon width={26} height={26} />
        </TouchableOpacity>

      </View>
    </View>
  )
}

export default TopBar
