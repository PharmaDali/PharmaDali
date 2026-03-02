import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '@shared/colorPallete'
import RxIcon from '@assets/icons/rx_icon.svg'
import BandaidImg from '@assets/images/bandaid_img.png'
import BetadineImg from '@assets/images/betadine_img.png'
import InfoIcon from '@assets/icons/red_info_icon.svg'
import LocationIcon from '@assets/icons/red_location_icon.svg'
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg'

const initialCartItems = [
  {
    id: 1,
    img: BandaidImg,
    description: 'OMRON MC-720 Digital Forehead Thermometer ...',
    price: 3480.00,
    size: 'N/A',
    quantity: 1,
    prescriptionRequired: false,
    selected: false,
  },
  {
    id: 2,
    img: BetadineImg,
    description: 'Imodium 2mg 4s - Diarrhea Medicine, Loperamide',
    price: 80.25,
    size: '2mg',
    quantity: 1,
    prescriptionRequired: false,
    selected: true,
  },
  {
    id: 3,
    img: BetadineImg,
    description: 'LACRYVISC Carbomer 10g [Prescription Required]',
    price: 437.75,
    size: '10g',
    quantity: 1,
    prescriptionRequired: true,
    selected: false,
  },
]

function Checkbox({ checked, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} className="mr-3 items-center justify-center">
      <View
        className={`w-5 h-5 rounded border-2 items-center justify-center ${
          checked ? 'bg-[#48AAD9] border-[#48AAD9]' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Text className="text-white text-[10px]">✓</Text>}
      </View>
    </TouchableOpacity>
  )
}

function QuantityControl({ quantity, onIncrement, onDecrement }) {
  return (
    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={onDecrement}
        className="w-7 h-7 rounded-lg border border-[#48AAD9] items-center justify-center"
      >
        <Text className="text-[#48AAD9] text-base" style={styles.fontBold}>−</Text>
      </TouchableOpacity>
      <Text className="mx-3 text-sm" style={styles.fontSemiBold}>{quantity}</Text>
      <TouchableOpacity
        onPress={onIncrement}
        className="w-7 h-7 rounded-lg bg-[#48AAD9] items-center justify-center"
      >
        <Text className="text-white text-base" style={styles.fontBold}>+</Text>
      </TouchableOpacity>
    </View>
  )
}

function CartItem({ item, onToggle, onIncrement, onDecrement }) {
  return (
    <View className="flex-row items-start bg-white rounded-2xl border border-gray-200 p-3 mb-3 mx-4">
      <Checkbox checked={item.selected} onPress={onToggle} />
      <Image source={item.img} className="w-20 h-20 rounded-lg" resizeMode="contain" />
      <View className="flex-1 ml-3">
        <Text className="text-xs" style={styles.fontSemiBold} numberOfLines={2}>
          {item.description}
        </Text>
        {item.prescriptionRequired && (
          <View className="flex-row items-center mt-1">
            <RxIcon width={12} height={12} />
            <Text className="text-[10px] ml-1" style={styles.rxText}>Prescription Required</Text>
          </View>
        )}
        <Text className="text-[10px] text-gray-500 mt-1" style={styles.fontMedium}>
          Size: {item.size}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm" style={styles.priceText}>
            ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          <QuantityControl
            quantity={item.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        </View>
      </View>
    </View>
  )
}

const Cart = () => {
  const router = useRouter()
  const [cartItems, setCartItems] = useState(initialCartItems)

  const toggleItem = (id) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
  }

  const incrementQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    )
  }

  const decrementQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    )
  }

  const allSelected = cartItems.every((item) => item.selected)
  const toggleAll = () => {
    const newVal = !allSelected
    setCartItems((prev) => prev.map((item) => ({ ...item, selected: newVal })))
  }

  const clearAll = () => {
    setCartItems([])
  }

  const selectedItems = cartItems.filter((item) => item.selected)
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const hasPrescription = cartItems.some((item) => item.prescriptionRequired)

  return (
    <SafeAreaView className="flex-1 bg-[#F1F4FF]" edges={['bottom']}>
      <View className="flex-row items-center justify-between px-5 pt-12 pb-4" style={styles.header}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowBackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text className="text-lg text-white" style={styles.fontSemiBold}>
            Shopping Cart ({cartItems.length})
          </Text>
        </View>
        <TouchableOpacity onPress={clearAll}>
          <Text className="text-white text-sm" style={styles.fontMedium}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-start bg-[#E8F4FD] rounded-xl mx-4 mt-4 p-3 border border-[#B8DEF0]">
        <LocationIcon width={17} height={17} />
        <View className="flex-1">
          <Text className="text-xs" style={styles.fontSemiBold}>Pickup at Burgos Street Branch</Text>
          <Text className="text-[10px] text-gray-500 mt-0.5" style={styles.fontMedium}>
            Availability depends on selected branch. You can change this in the next step.
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onToggle={() => toggleItem(item.id)}
            onIncrement={() => incrementQty(item.id)}
            onDecrement={() => decrementQty(item.id)}
          />
        ))}

        {hasPrescription && (
          <View className="flex-row items-center mx-4 mt-1 mb-4 gap-1">
            <InfoIcon width={15} height={15} />
            <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>
              Prescription required for some items.
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
        <View className="flex-row items-center">
          <Checkbox checked={allSelected} onPress={toggleAll} />
          <Text className="text-sm" style={styles.fontMedium}>All</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-4">
            <Text className="text-xs text-gray-500" style={styles.fontMedium}>Total:</Text>
            <Text className="text-base" style={styles.totalPrice}>
              ₱ {total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <TouchableOpacity className="bg-[#48AAD9] rounded-xl px-6 py-2.5"
            onPress={() => router.push('/customer/tabs/cart/ReviewOrder')}
          >
            <Text className="text-sm text-white" style={styles.fontSemiBold}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Cart

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.buttonColor,
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  rxText: {
    fontFamily: 'Poppins-Medium',
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
})