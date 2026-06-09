import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@src/shared/theme/colorPalette'
import MainLogo from '@src/shared/components/MainLogo'
import HamburgerMenuIcon from '@assets/icons/hamburger_menu_icon.svg'
import ChatIcon from '@assets/icons/chat_icon.svg'
import { useRouter } from 'expo-router'

const TopBar = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View className="bg-sky-500" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-around px-4 py-2">
        <TouchableOpacity className="p-2">
          <HamburgerMenuIcon width={28} height={28} />
        </TouchableOpacity>

        <MainLogo />

        <TouchableOpacity onPress={() => router.push('/tabs/chat/Chat')} className="p-2">
          <ChatIcon width={26} height={26} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default TopBar
