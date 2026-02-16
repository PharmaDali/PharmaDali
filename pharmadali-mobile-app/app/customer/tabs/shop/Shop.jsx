import { StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import React from 'react'
import { colors } from '@shared/colorPallete';
import BandaidImg from '@assets/images/bandaid_img.png';
import BetadineImg from '@assets/images/betadine_img.png';
import ProductCard from '@shared/components/ProductCard';

const Shop = () => {
  return (
    <ScrollView style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text className="text-2xl font-bold p-5" style={styles.sectionLabel}>
          Categories
        </Text>
        {/* TODO: add catefories icon here */}
        <View className="flex-row flex-wrap px-4">
          <CategoryCard icon={<Text>💊</Text>} label="Presciption Medicines" />
          <CategoryCard icon={<Text>💊</Text>} label="Over-the-Counter" />
          <CategoryCard icon={<Text>💊</Text>} label="Vitamins & Supplements" />
          <CategoryCard icon={<Text>💊</Text>} label="Baby & Kids" />
          <CategoryCard icon={<Text>💊</Text>} label="Personal Care" />
          <CategoryCard icon={<Text>💊</Text>} label="Medical Supplements" />
          <CategoryCard icon={<Text>💊</Text>} label="Chronic Care" />
          <CategoryCard icon={<Text>💊</Text>} label="Mother and Reproductive" />
        </View>
      </View>
      <View>
        <Text className="text-2xl font-bold p-5" style={styles.categoriesTex}>
          Recently Viewed
        </Text>
      </View>
      <View className="flex-row flex-wrap px-4">
        {dummyData.map((item, index) => (
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

function CategoryCard({ icon, label }) {
  return (
    <View className="w-1/4 items-center mb-4 px-1">
      <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center">
        {icon}
      </View>
      <Text className="text-sm mt-2 text-center" numberOfLines={2}>{label}</Text>
    </View>
  );
}

const dummyData = [
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
]

export default Shop

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    color: colors.textColor,
  },
})