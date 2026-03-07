import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { colors } from '@shared/colorPallete'
import ClockIcon from '@assets/icons/clock_icon.svg'
import PromotionsIcon from '@assets/icons/promotions_icon.svg'
import ArrowForwardIcon from '@assets/icons/arrow_forward_icon.svg'
import BandaidImg from '@assets/images/bandaid_img.png'
import BetadineImg from '@assets/images/betadine_img.png'

const orderNotifications = [
  {
    img: BandaidImg,
    title: 'Order Approved',
    description: 'Order ',
    orderNumber: '#6',
    descriptionEnd: ' has been approved. Kindly wait for your order to be prepared.',
    date: 'Januanry 25, 2026, 10:00am',
  },
  {
    img: BetadineImg,
    title: 'Payment Confirmed',
    description: 'Payment for order ',
    orderNumber: '#5',
    descriptionEnd: ' has been confirmed. Kindly pickup your order.',
    date: 'Januanry 20, 2026, 09:10am',
  },
  {
    img: BandaidImg,
    title: 'Order Ready',
    description: 'Order ',
    orderNumber: '#5',
    descriptionEnd: ' has been processed and ready for pickup.',
    date: 'Januanry 20, 2026, 09:05am',
  },
  {
    img: BetadineImg,
    title: 'Order Rejected',
    description: 'Order ',
    orderNumber: '#4',
    descriptionEnd: ' cannot be fulfilled and has been rejected.',
    date: 'Januanry 10, 2026, 10:00am',
  },
]

const pharmaDaliUpdates = [
  {
    icon: <PromotionsIcon width={28} height={28} />,
    title: 'Promotions',
    description: 'Check all the promos available at PharmaDali!',
    trailing: <ArrowForwardIcon width={18} height={18} />,
  },
]

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center">
        <View className="flex-row items-center gap-6 mt-5 rounded-2xl shadow-xl px-8 py-2 bg-white border border-gray-200 self-center">
          <TouchableOpacity onPress={() => setActiveTab('orders')}>
            <Text
              className="text-base"
              style={activeTab === 'orders' ? styles.semiBoldText : styles.text}
            >
              Order Updates
            </Text>
            {activeTab === 'orders' && (
              <View className="mt-1 h-0.5 rounded-full" style={{ backgroundColor: colors.buttonColor }} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('pharmadali')}>
            <Text
              className="text-base"
              style={activeTab === 'pharmadali' ? styles.semiBoldText : styles.text}
            >
              PharmaDali Updates
            </Text>
            {activeTab === 'pharmadali' && (
              <View className="mt-1 h-0.5 rounded-full" style={{ backgroundColor: colors.buttonColor }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      

      <View className="h-px bg-gray-200 mx-4" />

      <View className="px-4 pt-2 pb-6">
        {activeTab === 'orders'
          ? orderNotifications.length > 0
            ? orderNotifications.map((item, index) => (
              <NotificationCard
                key={index}
                left={<Image source={item.img} className="w-16 h-16 rounded-lg" resizeMode="contain" />}
                title={item.title}
                description={
                  <Text className="text-xs leading-4" style={styles.text}>
                    {item.description}
                    <Text style={{ color: colors.buttonColor, fontFamily: 'Poppins-SemiBold' }}>
                      {item.orderNumber}
                    </Text>
                    {item.descriptionEnd}
                  </Text>
                }
                footer={
                  <View className="flex-row items-center mt-2">
                    <ClockIcon width={14} height={14} />
                    <Text className="text-xs ml-1 text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
                      {item.date}
                    </Text>
                  </View>
                }
              />
            ))
            : <EmptyState message="No order updates" />
          : pharmaDaliUpdates.length > 0
            ? pharmaDaliUpdates.map((item, index) => (
              <NotificationCard
                key={index}
                left={
                  <View className="w-12 h-12 rounded-full items-center justify-center">
                    {item.icon}
                  </View>
                }
                title={item.title}
                description={
                  <Text className="text-xs leading-4" style={styles.text}>
                    {item.description}
                  </Text>
                }
                trailing={item.trailing}
              />
            ))
            : <EmptyState message="No PharmaDali updates" />}
      </View>
    </ScrollView>
  )
}

function EmptyState({ message }) {
  return (
    <View className="items-center justify-center py-20">
      <Text className="text-sm text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
        {message}
      </Text>
    </View>
  )
}

function NotificationCard({ left, title, description, footer, trailing }) {
  return (
    <View className="flex-row bg-white rounded-2xl p-4 mt-2 border border-gray-200 items-center">
      {left}
      <View className="flex-1 ml-3">
        <Text className="text-sm mb-1" style={{ fontFamily: 'Poppins-Bold', color: colors.textColor }}>
          {title}
        </Text>
        {description}
        {footer}
      </View>
      {trailing && (
        <View className="ml-2">
          {trailing}
        </View>
      )}
    </View>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F4FF',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    color: colors.textColor,
  },
  semiBoldText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
})