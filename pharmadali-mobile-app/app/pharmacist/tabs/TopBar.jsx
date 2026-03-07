import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@shared/colorPallete'
import MainLogo from '@shared/components/MainLogo'
import HamburgerMenuIcon from '@assets/icons/hamburger_menu_icon.svg'
import ChatIcon from '@assets/icons/chat_icon.svg'

const TopBar = () => {
  return (
    <SafeAreaView
      edges={['top']}
      style={{ backgroundColor: colors.buttonColor }}
    >
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
    </SafeAreaView>
  )
}

export default TopBar