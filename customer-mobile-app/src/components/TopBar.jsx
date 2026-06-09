import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import MainLogo from '@shared/components/MainLogo'
import { colors } from '@shared/theme/colorPalette'
import { TextInput } from 'react-native-paper'
import CartIcon from '@assets/icons/cart_icon.svg'
import theme from '@shared/theme/inputTheme'
import React, { useCallback, useEffect, useState } from 'react'
import { getCartItemCount } from '@shared/services/cartService'
import { subscribeCartCountUpdates } from '@shared/services/cartCountEvents'
import { resetCartProductIdsCache, initializeCartProductIdsCache } from '@shared/utils/cartUtils'
import { useSearchContext } from '@shared/SearchContext'
import { usePathname } from 'expo-router'

const TopBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearchContext();

  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    try {
      const count = await getCartItemCount();
      setCartCount(count);
      resetCartProductIdsCache();
      initializeCartProductIdsCache();
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    loadCartCount();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeCartCountUpdates((event) => {
      if (event && event.type === 'increment') {
        setCartCount((prev) => prev + (event.quantity || 1));
      } else {
        loadCartCount();
      }
    });

    return unsubscribe;
  }, [loadCartCount]);

  return (
    <View style={{ backgroundColor: colors.buttonColor}} className="py-4 px-5 pt-3">
      <View className="flex-row items-center justify-between mb-[-20px]">
        <MainLogo />
        <TouchableOpacity onPress={() => router.push('/tabs/cart/Cart')}>
          <View className="relative w-[30px] h-[30px] items-center justify-center">
            <CartIcon width={30} height={30} />
          {cartCount > 0 && (
            <View className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 items-center justify-center border border-white">
              <Text className="text-[10px] leading-[12px] text-white" style={{ fontFamily: 'Poppins-Bold' }}>
                {cartCount > 99 ? '99+' : String(cartCount)}
              </Text>
            </View>
          )}
          </View>
        </TouchableOpacity>
      </View>
      <TextInput
        placeholder="Search"
        mode="outlined"
        left={<TextInput.Icon icon="magnify" />}
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
