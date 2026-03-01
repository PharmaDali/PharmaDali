import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { colors } from '@shared/colorPallete'
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg'
import MainLogoSVG from '@assets/main_logo.svg'

export default function LogoHeader() {
  const router = useRouter()

  return (
    <View className="items-center px-5 pt-12 pb-3" style={styles.header}>
      <View className="flex-row items-center w-full">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-0 z-10">
          <ArrowBackIcon width={24} height={24} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <MainLogoSVG width={160} height={40} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.buttonColor,
  },
})
