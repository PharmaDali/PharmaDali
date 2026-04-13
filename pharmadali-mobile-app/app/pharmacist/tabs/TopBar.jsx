import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@src/shared/theme/colorPalette'
import MainLogo from '@src/shared/components/MainLogo'
import HamburgerMenuIcon from '@assets/icons/hamburger_menu_icon.svg'
import ChatIcon from '@assets/icons/chat_icon.svg'

const TopBar = () => {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ backgroundColor: colors.buttonColor, paddingTop: insets.top }}>
      <View
        className="flex-row items-center justify-around"
      >
        <TouchableOpacity>
          <HamburgerMenuIcon width={28} height={28} />
        </TouchableOpacity>

        <MainLogo />

        <TouchableOpacity>
          <ChatIcon width={26} height={26} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default TopBar
