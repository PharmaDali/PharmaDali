import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '@shared/colorPalette';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import StoreIcon from '@assets/icons/store_icon.svg';
import HomeCarousel from '@assets/icons/home_carousel.svg';
import ProductCard from '@shared/components/ProductCard';
import BandaidImg from '@assets/images/bandaid_img.png';
import SkeletonHome from '@shared/components/SkeletonHome';
import BranchSelectionOverlay from '@shared/components/BranchSelectionOverlay';
import { useSelectionPhase } from '@shared/SelectionPhaseContext';
import { formatProductPrice, useHomeTab } from '@shared/hooks/useHomeTab';

export default function HomeScreen() {
  const route = useRouter();
  const { setSelectionPhase, selectedBranch, setSelectedBranch } = useSelectionPhase();
  const { loading, categories, branchProducts, normalizeSelectedBranch } = useHomeTab(selectedBranch);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(normalizeSelectedBranch(branch));
    setSelectionPhase(false);
  };

  if (loading) return <SkeletonHome />;

  if (!selectedBranch) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom', 'top']}>
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
            <Text className="text-green-600">|</Text> {selectedBranch?.name || 'Selected branch'}
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
          {categories.map((item) => {
            const label = item?.category_name || 'Category';

            return (
              <CategoryCard
                key={item?.id || label}
                icon="🛍️"
                label={label}
                onPress={() =>
                  route.push({
                    pathname: '/customer/tabs/shop/Categories',
                    params: {
                      category: label,
                      categoryId: String(item?.id ?? ''),
                    },
                  })
                }
              />
            );
          })}
        </ScrollView>
      </View>
      <View className="mt-4 mb-4">
        <View className="flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl text-gray-600 px-2 py-2 mt-6" style={{ fontFamily: 'Poppins-Bold' }}>
            Branch Products
          </Text>
          <Text
            className="text-md text-gray-600 px-2 py-2 mt-6"
            style={[styles.seeAllLink, { fontFamily: 'Poppins-SemiBold' }]}
            onPress={() => route.push('/customer/tabs/shop/Shop')}
          >
            See all
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-2">
          {branchProducts.map((item, index) => (
            <ProductCard
              key={`${item?.id ?? 'product'}-${index}`}
              productId={String(item?.product_id ?? '')}
              img={BandaidImg}
              description={item?.product?.product_name || 'Unnamed product'}
              category={item?.category?.category_name || 'Uncategorized'}
              price={formatProductPrice(item?.selling_price)}
              style={{ width: 150, marginRight: 12 }}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

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
