import { View, Keyboard } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import MainLogo from '@shared/components/MainLogo'
import { colors } from '@shared/theme/colorPalette'
import { TextInput } from 'react-native-paper'
import theme from '@shared/theme/inputTheme'
import React, { useEffect, useRef } from 'react'
import { useSearchContext } from '@shared/context/SearchContext'
import CartButton from '@shared/components/CartButton'

const TopBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearchContext();
  const searchInputRef = useRef(null);

  // Unactivate search bar whenever navigating away from the Search tab
  useEffect(() => {
    if (pathname !== '/tabs/Search') {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      if (searchQuery) {
        setSearchQuery('');
      }
    }
  }, [pathname, searchQuery, setSearchQuery]);

  return (
    <View style={{ backgroundColor: colors.buttonColor }} className="py-4 px-5 pt-3">
      <View className="flex-row items-center justify-between mb-[-20px]">
        <MainLogo />
        <CartButton />
      </View>
      <TextInput
        ref={searchInputRef}
        placeholder="Search"
        mode="outlined"
        textColor="#444444"
        contentStyle={{ color: '#444444' }}
        style={{ color: '#444444' }}
        left={<TextInput.Icon icon="magnify" />}
        right={
          searchQuery ? (
            <TextInput.Icon
              icon="close"
              onPress={() => {
                setSearchQuery('');
              }}
            />
          ) : null
        }
        theme={theme}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          if (pathname !== '/tabs/Search') {
            router.push('/tabs/Search');
          }
        }}
        onFocus={() => {
          if (pathname !== '/tabs/Search') {
            router.push('/tabs/Search');
          }
        }}
      />
    </View>
  )
}

export default TopBar
