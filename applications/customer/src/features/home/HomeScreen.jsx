import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '@src/shared/theme/colorPalette';
import CategoriesSlider from '@src/components/customer-home/CategoriesSlider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import StoreIcon from '@assets/icons/store_icon.svg';
import HeroImage from '@assets/images/hero-image.svg';
import ArrowRightIcon from '@assets/icons/arrow-right.svg';
import ProductCard from '@shared/components/ProductCard';
import SkeletonHome from '@shared/components/SkeletonHome';
import PharmacySelectionOverlay from '@shared/components/PharmacySelectionOverlay';
import SearchOverlay from '@shared/components/SearchOverlay';
import { useSelectionPhase } from '@shared/SelectionPhaseContext';
import { formatProductPrice, useHomeTab } from '@shared/hooks/useHomeTab';
import { useProfile } from '@shared/hooks/useProfile';
import { addPharmacyProductToCart } from '@shared/utils/cartUtils';
import ToastMessage from '@shared/components/ToastMessage';
import { useToast } from '@shared/hooks/useToast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toTitleCase } from '@shared/utils/stringUtils';

export default function HomeScreen() {
  const route = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { setSelectionPhase, selectedPharmacy, setSelectedPharmacy } = useSelectionPhase();
  const {
    loading,
    refreshing,
    refetch,
    categories,
    pharmacyProducts,
    heroRecommendations,
    recommendations,
    isFetchingMoreRecs,
    loadMoreRecommendations,
    normalizeSelectedPharmacy,
  } = useHomeTab(selectedPharmacy);
  const { toast, showError } = useToast();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(true);

  const pharmacyStatusLabel = selectedPharmacy?.isOpen
    ? (selectedPharmacy?.formattedClosingHour ? `Open til ${selectedPharmacy.formattedClosingHour}` : 'Open now')
    : (selectedPharmacy?.formattedOpeningHour ? `Closed | Opens ${selectedPharmacy.formattedOpeningHour}` : 'Closed');
  const isPharmacyOpen = !!selectedPharmacy?.isOpen;

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(normalizeSelectedPharmacy(pharmacy));
    setSelectionPhase(false);
  };

  const handleAddToCart = useCallback(({ pharmacyProductId, quantity = 1 }) => {
    const pharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id;

    return addPharmacyProductToCart({
      pharmacyId,
      pharmacyProductId,
      quantity,
      validationMessages: {
        missingPharmacy: 'Please select a pharmacy and try again.',
        missingProduct: 'Please select a pharmacy and try again.',
      },
    }).then((result) => {
      if (!result.ok) {
        showError(result.errorMessage);
      }
      return result;
    });
  }, [selectedPharmacy, showError]);

  if (loading) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <SkeletonHome />
      </View>
    );
  }

  if (!selectedPharmacy) {
    return (
      <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
        <SkeletonHome />
        <PharmacySelectionOverlay visible={true} onSelect={handlePharmacySelect} />
      </View>
    );
  }

  const recommendationFeedData = recommendations?.length ? recommendations : (pharmacyProducts ?? []);

  const renderHeader = () => (
    <View>
      {isSearchVisible && (
        <SearchOverlay
          visible={isSearchVisible}
          onClose={() => setIsSearchVisible(false)}
          pharmacyId={selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id}
          onAddToCart={handleAddToCart}
        />
      )}
      <View className="flex-row items-center justify-between px-4 pt-6">
        <Text className="text-3xl text-start" style={styles.greetingMedium}>
          Magandang Araw, <Text style={styles.greetingBold}>{toTitleCase(profile?.first_name) || 'User'}!</Text>
        </Text>
      </View>

      <View className="px-4 mt-6">
        <View className={`flex-row items-center rounded-full px-4 py-2 self-end shadow-sm border ${isPharmacyOpen ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
          <View className={`w-6 h-6 rounded-full mr-2 items-center justify-center ${isPharmacyOpen ? 'bg-green-600' : 'bg-red-600'}`}>
            <StoreIcon width={24} height={24} />
          </View>
          <Text className="text-sm text-gray-700" style={{ fontFamily: 'Poppins-Medium' }}>
            <Text style={{ fontFamily: 'Poppins-Bold' }}>{pharmacyStatusLabel} </Text>
            <Text className={isPharmacyOpen ? 'text-green-600' : 'text-red-600'}>|</Text> {selectedPharmacy?.name || 'Selected pharmacy'}
          </Text>
        </View>
      </View>

      {/* ── Hero Section ── */}
      <View className="mx-4 mt-8 rounded-2xl overflow-hidden">
        <HeroImage
          width="100%"
          height={200}
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <View className="px-5 pt-3 pb-5">
          <View className="flex-1 pr-4">
            <Text
              className="text-2xl text-gray-800"
              style={{ fontFamily: 'Poppins-Bold'}}
            >
              {heroRecommendations?.hero_title || 'Welcome to PharmaDali!'}
            </Text>
            <Text
              className="mt-3 text-xs text-gray-700 leading-5"
              style={{ fontFamily: 'Poppins-Regular' }}
            >
              {heroRecommendations?.hero_subtitle || 'Find the medicines and healthcare essentials you need in one place.'}
            </Text>
            {!heroRecommendations && (
              <Text
                className="mt-2 text-xs text-gray-700 leading-5"
                style={{ fontFamily: 'Poppins-Regular' }}
              >
                Order ahead with ease and pick up your items when they're ready.
              </Text>
            )}
            <TouchableOpacity
              className="mt-5 flex-row items-center justify-center self-start rounded-xl bg-sky-500 px-4 py-2"
              onPress={() => route.push('/tabs/shop/Shop')}
              activeOpacity={0.8}
            >
              <Text className="text-base text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Start Browsing
              </Text>
              <ArrowRightIcon width={18} height={18} style={{ marginLeft: 6 }} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Categories Section ── */}
      <View>
        <View className="flex-row items-center justify-between px-4 py-2 mt-4">
          <Text className="text-2xl text-gray-600 px-2 py-2 mt-6" style={{ fontFamily: 'Poppins-Bold' }}>
            Categories
          </Text>
          <Text className="text-md text-gray-600 px-2 py-2 mt-6" style={[styles.seeAllLink, { fontFamily: 'Poppins-SemiBold' }]}
            onPress={() => route.push({ pathname: '/tabs/shop/Shop', params: { expandCategories: 'true' } })}
          >
            See all
          </Text>
        </View>

        <CategoriesSlider
          categories={categories}
          limit={8}
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

      {/* ── Recommendations Section Header ── */}
      <View className="mt-4 mb-2">
        <View className="flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl text-gray-600 px-2 py-1" style={{ fontFamily: 'Poppins-Bold' }}>
            Recommendations
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={insets.top + 8}
      />
      
      <FlatList
        className="flex-1 bg-white"
        data={recommendationFeedData}
        numColumns={2}
        keyExtractor={(item, index) => `${item?.id ?? 'product'}-${index}`}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 40 }}
        onEndReached={loadMoreRecommendations}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => {
          if (!isFetchingMoreRecs) return null;
          return (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#48AAD9" />
              <Text className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Poppins-Medium' }}>
                Loading more recommendations...
              </Text>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refetch}
            colors={['#48AAD9']}
            tintColor="#48AAD9"
          />
        }
        renderItem={({ item }) => {
          const pharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null;

          return (
            <View style={{ width: '48%' }}>
              <ProductCard
                productId={String(item?.product_id ?? '')}
                pharmacyProductId={item?.id}
                pharmacyId={pharmacyId}
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
                style={{ width: '100%' }}
              />
            </View>
          );
        }}
      />

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

