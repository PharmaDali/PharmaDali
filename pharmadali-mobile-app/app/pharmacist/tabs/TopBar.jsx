import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { colors } from '@shared/colorPallete'
import MainLogo from '@shared/components/MainLogo'
import HamburgerMenuIcon from '@assets/icons/hamburger_menu_icon.svg'
import ChatIcon from '@assets/icons/chat_icon.svg'

const TopBar = () => {
  return (
    <View
      className="flex-row items-center justify-around"
      style={{ backgroundColor: colors.buttonColor }}
    >
      <TouchableOpacity>
        <HamburgerMenuIcon width={28} height={28} />
      </TouchableOpacity>

      <MainLogo />

      <TouchableOpacity>
        <ChatIcon width={26} height={26} />
      </TouchableOpacity>
    </View>
  )
}

export default TopBar