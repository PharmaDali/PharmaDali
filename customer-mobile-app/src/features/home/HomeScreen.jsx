import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '@src/shared/theme/colorPalette';
import CategoriesSlider from '@src/components/customer-home/CategoriesSlider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import StoreIcon from '@assets/icons/store_icon.svg';
import HomeCarousel from '@assets/icons/home_carousel.svg';
import ProductCard from '@shared/components/ProductCard';
import SkeletonHome from '@shared/components/SkeletonHome';
import BranchSelectionOverlay from '@shared/components/BranchSelectionOverlay';
import SearchOverlay from '@shared/components/SearchOverlay';
import { useSelectionPhase } from '@shared/SelectionPhaseContext';
import { formatProductPrice, useHomeTab } from '@shared/hooks/useHomeTab';
import { useProfile } from '@shared/hooks/useProfile';
import { addBranchProductToCart } from '@shared/utils/cartUtils';
import ToastMessage from '@shared/components/ToastMessage';
import { useToast } from '@shared/hooks/useToast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toTitleCase } from '@shared/utils/stringUtils';

export default function HomeScreen() {
  const route = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { setSelectionPhase, selectedBranch, setSelectedBranch } = useSelectionPhase();
  const { loading, categories, branchProducts, normalizeSelectedBranch } = useHomeTab(selectedBranch);
  const { toast, showSuccess, showError } = useToast();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(true);

  const branchStatusLabel = selectedBranch?.isOpen
    ? (selectedBranch?.formattedClosingHour ? `Open til ${selectedBranch.formattedClosingHour}` : 'Open now')
    : (selectedBranch?.formattedOpeningHour ? `Closed | Opens ${selectedBranch.formattedOpeningHour}` : 'Closed');
  const isBranchOpen = !!selectedBranch?.isOpen;

  const handleBranchSelect = (branch) => {
    setSelectedBranch(normalizeSelectedBranch(branch));
    setSelectionPhase(false);
  };

  const handleAddToCart = useCallback(({ branchProductId, quantity = 1 }) => {
    const branchId = selectedBranch?.id ?? selectedBranch?.branch_id;

    return addBranchProductToCart({
      branchId,
      branchProductId,
      quantity,
      validationMessages: {
        missingBranch: 'Please select a branch and try again.',
        missingProduct: 'Please select a branch and try again.',
      },
    }).then((result) => {
      if (!result.ok) {
        showError(result.errorMessage);
      }
      return result;
    });
  }, [selectedBranch, showError]);

  if (loading) return <SkeletonHome />;

  if (!selectedBranch) {
    return (
      <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
        <SkeletonHome />
        <BranchSelectionOverlay visible={true} onSelect={handleBranchSelect} />
      </View>
    );
  }

  return (
    <View className="relative flex-1 bg-white">
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={insets.top + 8}
      />
      
      {isSearchVisible && (
        <SearchOverlay
          visible={isSearchVisible}
          onClose={() => setIsSearchVisible(false)}
          branchId={selectedBranch?.id ?? selectedBranch?.branch_id}
          onAddToCart={handleAddToCart}
        />
      )}

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
      <View className="flex-row items-center justify-between px-4 pt-6">
        <Text className="text-3xl text-start" style={styles.greetingMedium}>
          Magandang Araw, <Text style={styles.greetingBold}>{toTitleCase(profile?.first_name) || 'User'}!</Text>
        </Text>
      </View>

      <View className="px-4 mt-2">
        <View className={`flex-row items-center rounded-full px-4 py-2 self-end shadow-sm border ${isBranchOpen ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
          <View className={`w-6 h-6 rounded-full mr-2 items-center justify-center ${isBranchOpen ? 'bg-green-600' : 'bg-red-600'}`}>
            <StoreIcon width={24} height={24} />
          </View>
          <Text className="text-sm text-gray-700" style={{ fontFamily: 'Poppins-Medium' }}>
            <Text style={{ fontFamily: 'Poppins-Bold' }}>{branchStatusLabel} </Text>
            <Text className={isBranchOpen ? 'text-green-600' : 'text-red-600'}>|</Text> {selectedBranch?.name || 'Selected branch'}
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
            onPress={() => route.push('/tabs/shop/Shop')}
          >
            See all
          </Text>
        </View>

        <CategoriesSlider
          categories={categories}
          onCategoryPress={(item, label) =>
            route.push({
              pathname: '/tabs/shop/Categories',
              params: {
                category: label,
                categoryId: String(item?.id ?? ''),
              },
            })
          }
        />
        
      </View>
      <View className="mt-4 mb-4">
        <View className="flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl text-gray-600 px-2 py-2 mt-6" style={{ fontFamily: 'Poppins-Bold' }}>
            Branch Products
          </Text>
          <Text
            className="text-md text-gray-600 px-2 py-2 mt-6"
            style={[styles.seeAllLink, { fontFamily: 'Poppins-SemiBold' }]}
            onPress={() => route.push('/tabs/shop/Shop')}
          >
            See all
          </Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={branchProducts}
          keyExtractor={(item, index) => `${item?.id ?? 'product'}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item }) => {
            const branchId = selectedBranch?.id ?? selectedBranch?.branch_id ?? null;

            return (
              <View>
                <ProductCard
                  productId={String(item?.product_id ?? '')}
                  branchProductId={item?.id}
                  branchId={branchId}
                  img={item?.product?.image_url}
                  product={item?.product}
                  categoryName={item?.category?.category_name}
                  description={item?.product?.product_name || 'Unnamed product'}
                  category={item?.category?.category_name || 'Uncategorized'}
                  price={formatProductPrice(item?.selling_price)}
                  isPrescribed={Boolean(Number(item?.product?.is_prescribed))}
                  isAvailable={
                    item?.is_available == null
                      ? true
                      : (typeof item?.is_available === 'boolean'
                        ? item.is_available
                        : Number(item.is_available) === 1)
                  }
                  onAddToCart={handleAddToCart}
                  style={{ width: 150, marginRight: 12 }}
                />
              </View>
            );
          }}
        />
      </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => {
          setHasUnreadMessage(false);
          route.push('/tabs/chat/Chat');
        }}
        activeOpacity={0.9}
        className="absolute right-4 h-14 w-14 items-center justify-center rounded-full bg-sky-500 shadow-lg shadow-slate-900/30"
        style={{ bottom: Math.max(insets.bottom, 16) + 12 }}
      >
        <MaterialCommunityIcons name="message-text-outline" size={26} color="#fff" />
        {hasUnreadMessage && (
          <View className="absolute top-3 right-3 h-3 w-3 rounded-full bg-red-500 border-2 border-sky-500" />
        )}
      </TouchableOpacity>
    </View>
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

