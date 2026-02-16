import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '@shared/colorPallete';
import StoreIcon from '@assets/icons/store_icon.svg';
import HomeCarousel from '@assets/icons/home_carousel.svg';
import ProductCard from '@shared/components/ProductCard';
import BandaidImg from '@assets/images/bandaid_img.png';
import BetadineImg from '@assets/images/betadine_img.png';

export default function HomeTab() {
  return (
    <ScrollView 
      className="bg-white"
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl text-start px-4 py-6">
        Magandang Araw, <Text className="font-bold" style={styles.userName}>Denmar!</Text>
      </Text>
      <View className="px-4">
        <View className="flex-row items-center bg-green-100 rounded-full px-4 py-2 self-end shadow-sm border border-green-300">
          <View className="w-6 h-6 bg-green-600 rounded-full mr-2 items-center justify-center">
            <StoreIcon width={24} height={24} />
          </View>
          <Text className="text-sm text-gray-700">
            <Text className="font-bold">Open til 9 PM </Text>
            <Text className="text-green-600">|</Text> Lally's Pharmacy
          </Text>
        </View>
      </View>
      <View className="mt-6 items-center">
        <HomeCarousel width="100%" height={170} />
      </View>
      <View>
        <View className="flex-row items-center justify-between px-4 py-2 mt-4">
          <Text className="text-2xl text-gray-600 font-bold px-4 py-2 mt-6">
            Categories
          </Text>
          <Text className="text-md text-gray-600 font-semibold px-4 py-2 mt-6" style={styles.seeAllLink}>
            See all
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-2">
          {categories.map((item, index) => (
            <CategoryCard key={index} icon={item.icon} label={item.label} />
          ))}
        </ScrollView>
      </View>
      <View className="mt-4 mb-4">
        <View className="flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl text-gray-600 font-bold px-4 py-2 mt-6">
            Bestseller Products
          </Text>
          <Text className="text-md text-gray-600 font-semibold px-4 py-2 mt-6" style={styles.seeAllLink}>
            See all
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-2">
          {bestSellers.map((item, index) => (
            <ProductCard
              key={index}
              img={item.img}
              description={item.description}
              category={item.category}
              price={item.price}
              style={{ width: 150, marginRight: 12 }}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const categories = [
  { icon: '💊', label: 'Medicine' },
  { icon: '🩹', label: 'First Aid' },
  { icon: '🧴', label: 'Skin Care' },
  { icon: '🦷', label: 'Dental' },
  { icon: '👶', label: 'Baby Care' },
  { icon: '💉', label: 'Vitamins' },
];

function CategoryCard({ icon, label }) {
  return (
    <TouchableOpacity className="items-center mr-4">
      <View className="w-16 h-16 rounded-full bg-blue-200 items-center justify-center">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <Text className="text-xs mt-1 text-gray-600">{label}</Text>
    </TouchableOpacity>
  );
}

const bestSellers = [
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
  
];

const styles = StyleSheet.create({
  userName: {
    color: colors.buttonColor
  },
  seeAllLink: {
      color: colors.buttonColor
  },
});