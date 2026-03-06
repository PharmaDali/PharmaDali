import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '@shared/colorPallete';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import StoreIcon from '@assets/icons/store_icon.svg';
import HomeCarousel from '@assets/icons/home_carousel.svg';
import ProductCard from '@shared/components/ProductCard';
import BandaidImg from '@assets/images/bandaid_img.png';
import BetadineImg from '@assets/images/betadine_img.png';
import SkeletonHome from '@shared/components/SkeletonHome';
import BranchSelectionOverlay from '@shared/components/BranchSelectionOverlay';
import { useSelectionPhase } from '@shared/SelectionPhaseContext';

export default function HomeTab() {
  const route = useRouter();
  const { selectionPhase, setSelectionPhase, selectedBranch, setSelectedBranch } = useSelectionPhase();
  const [loading, setLoading] = useState(!selectedBranch);

  useEffect(() => {
    if (selectedBranch) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [selectedBranch]);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setSelectionPhase(false);
  };

  if (loading) return <SkeletonHome />;

  if (!selectedBranch) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <SkeletonHome />
        <BranchSelectionOverlay visible={true} onSelect={handleBranchSelect} />
      </SafeAreaView>
    );
  }

  return (
    <ScrollView 
      className="bg-white"
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl text-start px-4 py-6" style={styles.greetingMedium}>
        Magandang Araw, <Text style={styles.greetingBold}>Denmar!</Text>
      </Text>
      <View className="px-4">
        <View className="flex-row items-center bg-green-100 rounded-full px-4 py-2 self-end shadow-sm border border-green-300">
          <View className="w-6 h-6 bg-green-600 rounded-full mr-2 items-center justify-center">
            <StoreIcon width={24} height={24} />
          </View>
          <Text className="text-sm text-gray-700" style={{ fontFamily: 'Poppins-Medium' }}>
            <Text style={{ fontFamily: 'Poppins-Bold' }}>Open til 9 PM </Text>
            <Text className="text-green-600">|</Text> Lally's Pharmacy
          </Text>
        </View>
      </View>
      <View className="mt-6 items-center">
        <HomeCarousel width="100%" height={170} />
      </View>
      <View>
        <View className="flex-row items-center justify-between px-4 py-2 mt-4">
          <Text className="text-2xl text-gray-600 px-2 py-2 mt-6" style={{ fontFamily: 'Poppins-Bold' }}>
            Categories
          </Text>
          <Text className="text-md text-gray-600 px-2 py-2 mt-6" style={[styles.seeAllLink, { fontFamily: 'Poppins-SemiBold' }]}
            onPress={() => route.push('/customer/tabs/shop/Shop')}
          >
            See all
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-2">
          {categories.map((item, index) => (
            <CategoryCard key={index} icon={item.icon} label={item.label} onPress={() => route.push({ pathname: '/customer/tabs/shop/Categories', params: { category: item.label } })} />
          ))}
        </ScrollView>
      </View>
      <View className="mt-4 mb-4">
        <View className="flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl text-gray-600 px-2 py-2 mt-6" style={{ fontFamily: 'Poppins-Bold' }}>
            Bestseller Products
          </Text>
          <Text className="text-md text-gray-600 px-2 py-2 mt-6" style={[styles.seeAllLink, { fontFamily: 'Poppins-SemiBold' }]}>
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

function CategoryCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity className="items-center mr-4" onPress={onPress}>
      <View className="w-16 h-16 rounded-full bg-blue-200 items-center justify-center">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <Text className="text-xs mt-1 text-gray-600" style={{ fontFamily: 'Poppins-Medium' }}>{label}</Text>
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
  greetingMedium: {
    fontFamily: 'Modulus-Medium',
  },
  greetingBold: {
    fontFamily: 'Modulus-Bold',
    color: colors.buttonColor,
  },
  seeAllLink: {
    color: colors.buttonColor,
  },
});