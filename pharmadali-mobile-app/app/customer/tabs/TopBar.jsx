import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import MainLogo from '@shared/components/MainLogo'
import { colors } from '@shared/colorPallete'
import { TextInput } from 'react-native-paper'
import CartIcon from '@assets/icons/cart_icon.svg'
import theme from '@shared/inputTheme'
import React from 'react'

const TopBar = () => {
  const router = useRouter();
  return (
    <View style={{ backgroundColor: colors.buttonColor}} className="py-4 px-5 pt-3">
      <View className="flex-row items-center justify-between mb-[-20px]">
        <MainLogo />
        <TouchableOpacity onPress={() => router.push('/customer/tabs/cart/Cart')}>
          <CartIcon width={30} height={30} />
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Search"
        mode="outlined"
        left={<TextInput.Icon icon="magnify" />}
        theme={theme}
      />
    </View>
  )
}

export default TopBar

const styles = StyleSheet.create({})