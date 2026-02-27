import { Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import BandaidImg from '@assets/images/bandaid_img.png'
import BetadineImg from '@assets/images/betadine_img.png'
import ProductCard from '@shared/components/ProductCard'

const categories = [
  { icon: '💊', label: 'Prescription Medicines' },
  { icon: '💊', label: 'Over-the-Counter' },
  { icon: '💊', label: 'Vitamins & Supplements' },
  { icon: '💊', label: 'Baby & Kids' },
  { icon: '💊', label: 'Personal Care' },
  { icon: '💊', label: 'Medical Supplies' },
  { icon: '💊', label: 'Chronic Care' },
  { icon: '💊', label: 'Mother and Reproductive' },
]

const recentlyViewed = [
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
]

const Shop = () => {
  const router = useRouter()

  const navigateToCategory = (label) => {
    router.push({ pathname: '/customer/tabs/shop/Categories', params: { category: label } })
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View>
        <Text className="text-2xl p-5" style={{ fontFamily: 'Poppins-Bold', color: '#444' }}>
          Categories
        </Text>
        <View className="flex-row flex-wrap px-4">
          {categories.map((cat, index) => (
            <CategoryCard
              key={index}
              icon={<Text>{cat.icon}</Text>}
              label={cat.label}
              onPress={() => navigateToCategory(cat.label)}
            />
          ))}
        </View>
      </View>

      <View>
        <Text className="text-2xl p-5" style={{ fontFamily: 'Poppins-Bold', color: '#444' }}>
          Recently Viewed
        </Text>
      </View>
      <View className="flex-row flex-wrap px-4">
        {recentlyViewed.map((item, index) => (
          <View key={index} className="w-1/2 px-1 mb-4">
            <ProductCard
              img={item.img}
              description={item.description}
              category={item.category}
              price={item.price}
              style={{ width: '100%' }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

function CategoryCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity className="w-1/4 items-center mb-4 px-1" onPress={onPress}>
      <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center">
        {icon}
      </View>
      <Text className="text-sm mt-2 text-center" style={{ fontFamily: 'Poppins-Medium' }} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  )
}

export default Shop