import { View, Keyboard } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
import MainLogo from '@shared/components/MainLogo'
import { colors } from '@shared/theme/colorPalette'
import { TextInput } from 'react-native-paper'
import theme from '@shared/theme/inputTheme'
import React, { useEffect, useRef } from 'react'
import { useSearchContext } from '@shared/context/SearchContext'
import CartButton from '@shared/components/CartButton'
import { stripEmojis } from '@src/shared/utils/inputSanitizers'
import { useFontSize } from '@shared/context/FontSizeContext'

const TopBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery, triggerSubmit } = useSearchContext();
  const { scaleFontSize } = useFontSize();

  const searchInputRef = useRef(null);

  // Unactivate search bar whenever navigating away from the Search tab (except when viewing product details)
  useEffect(() => {
    if (pathname !== '/tabs/Search' && !pathname?.startsWith('/tabs/shop/ProductView')) {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      if (searchQuery) {
        setSearchQuery('');
      }
    }
  }, [pathname, searchQuery, setSearchQuery]);

  return (
    <View style={{ backgroundColor: '#96D2EE' }} className="py-4 px-5 pt-3">
      <View className="flex-row items-center justify-between mb-[-20px]">
        <MainLogo />
        <CartButton />
      </View>
      <TextInput
        ref={searchInputRef}
        placeholder="Search"
        mode="outlined"
        dense
        textColor="#444444"
        contentStyle={{ color: '#444444', paddingVertical: 0 }}
        style={{ height: 40, backgroundColor: '#FFFFFF', fontSize: scaleFontSize(13) }}
        left={<TextInput.Icon icon="magnify" size={20} />}
        right={
          searchQuery ? (
            <TextInput.Icon
              icon="close"
              size={18}
              onPress={() => {
                setSearchQuery('');
              }}
            />
          ) : null
        }
        theme={theme}
        value={searchQuery}
        maxLength={100}
        onChangeText={(text) => {
          const clean = stripEmojis(text).slice(0, 100);
          setSearchQuery(clean);
          if (pathname !== '/tabs/Search') {
            router.push('/tabs/Search');
          }
        }}
        onSubmitEditing={() => {
          if (pathname !== '/tabs/Search') {
            router.push('/tabs/Search');
          }
          triggerSubmit();
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
