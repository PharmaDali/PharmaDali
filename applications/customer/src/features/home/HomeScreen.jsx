import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { colors } from '@src/shared/theme/colorPalette';
import CategoriesSlider from '@src/components/customer-home/CategoriesSlider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import StoreIcon from '@assets/icons/store_icon.svg';
import HeroImage from '@assets/images/hero-image.svg';
import ArrowRightIcon from '@assets/icons/arrow-right.svg';
import ProductCard from '@shared/components/ProductCard';
import SkeletonHome from '@shared/components/SkeletonHome';
import PharmacySelectionOverlay from '@shared/components/PharmacySelectionOverlay';
import SearchOverlay from '@shared/components/SearchOverlay';
import { useSelectionPhase } from '@shared/context/SelectionPhaseContext';
import { formatProductPrice, useHomeTab } from '@shared/hooks/useHomeTab';
import { useProfile } from '@shared/hooks/useProfile';
import { addPharmacyProductToCart } from '@shared/utils/cartUtils';
import ToastMessage from '@shared/components/ToastMessage';
import { useToast } from '@shared/hooks/useToast';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toTitleCase } from '@shared/utils/stringUtils';
import { formatBranchName } from '@shared/utils/notificationUtils';
import { getTimeBasedGreeting } from '@src/utils/pickupScheduleUtils';

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
  } = useHomeTab(selectedPharmacy, setSelectedPharmacy);
  const { toast, showError } = useToast();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isPharmacyModalVisible, setIsPharmacyModalVisible] = useState(false);


  const pharmacyStatusLabel = selectedPharmacy?.isOpen
    ? (selectedPharmacy?.formattedClosingHour ? `Open til ${selectedPharmacy.formattedClosingHour}` : 'Open now')
    : (selectedPharmacy?.formattedOpeningHour ? `Closed | Opens ${selectedPharmacy.formattedOpeningHour}` : 'Closed');
  const isPharmacyOpen = !!selectedPharmacy?.isOpen;

  const handlePharmacySelect = (pharmacy) => {
    setSelectedPharmacy(normalizeSelectedPharmacy(pharmacy));
    setSelectionPhase(false);
    setIsPharmacyModalVisible(false);
  };

  const cleanSelectedBranch =
    formatBranchName(selectedPharmacy?.name, selectedPharmacy?.address || selectedPharmacy?.location) ||
    selectedPharmacy?.name ||
    'Selected pharmacy';

  const greetingPrefix = getTimeBasedGreeting();

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

  const renderProductItem = useCallback(({ item }) => {
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
            (item?.is_available == null
              ? true
              : (typeof item?.is_available === 'boolean'
                ? item.is_available
                : Number(item.is_available) === 1)) &&
            (item?.is_expired == null ? true : !Boolean(Number(item.is_expired)))
          }
          isOutOfStock={Boolean(item?.is_out_of_stock) || (item?.stock !== undefined && Number(item?.stock) <= 0)}
          stock={item?.stock}
          onAddToCart={handleAddToCart}
          style={{ width: '100%' }}
        />
      </View>
    );
  }, [selectedPharmacy?.id, selectedPharmacy?.pharmacy_id, handleAddToCart]);

  if (!selectedPharmacy) {
    return (
      <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
        <SkeletonHome />
        <PharmacySelectionOverlay visible={true} onSelect={handlePharmacySelect} />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <ToastMessage
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          topOffset={insets.top + 8}
        />
        <SkeletonHome />
        <PharmacySelectionOverlay
          visible={isPharmacyModalVisible}
          onSelect={handlePharmacySelect}
          onClose={() => setIsPharmacyModalVisible(false)}
          currentPharmacyId={selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id}
        />
      </View>
    );
  }

  const recommendationFeedData = recommendations?.length ? recommendations : (pharmacyProducts ?? []);

  const renderHeader = () => (

    <View>
      {/* ── Top Bar: Pharmacy Selector Dropdown Pill ── */}
      <View className="px-4 pt-4 items-end">
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setIsPharmacyModalVisible(true)}
          style={styles.pharmacyPill}
        >
          <View style={styles.pillStoreIconWrap}>
            <MaterialCommunityIcons name="storefront-outline" size={13} color="#0284c7" />
          </View>
          <Text style={styles.pillBranchName} numberOfLines={1}>
            {cleanSelectedBranch}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: isPharmacyOpen ? '#22C55E' : '#EF4444' }]} />
          <Text style={[styles.pillStatusText, { color: isPharmacyOpen ? '#16A34A' : '#DC2626' }]}>
            {isPharmacyOpen ? 'Open' : 'Closed'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={15}
            color="#64748B"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      </View>

      {/* ── Greeting Section ── */}
      <View className="flex-row flex-wrap items-center px-4 pt-3">
        <Text style={styles.greetingMedium}>{greetingPrefix}</Text>
        <Text style={styles.greetingBold}>{toTitleCase(profile?.first_name) || 'User'}!</Text>
      </View>

      {/* ── Hero Section ── */}
      <View className="mx-4 mt-3.5 rounded-2xl overflow-hidden">
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
        <View className="flex-row items-center justify-between px-4 py-2 mt-5">
          <Text className="text-2xl text-gray-600 px-2" style={{ fontFamily: 'Poppins-Bold' }}>
            Categories
          </Text>
          <Text className="text-md text-gray-600 px-2" style={[styles.seeAllLink, { fontFamily: 'Poppins-SemiBold' }]}
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
        renderItem={renderProductItem}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
      />




      {/* Search overlay */}
      {isSearchVisible && (
        <SearchOverlay
          visible={isSearchVisible}
          onClose={() => setIsSearchVisible(false)}
          pharmacyId={selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Pharmacy selection overlay */}
      <PharmacySelectionOverlay
        visible={isPharmacyModalVisible}
        onSelect={handlePharmacySelect}
        onClose={() => setIsPharmacyModalVisible(false)}
        currentPharmacyId={selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pharmacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'flex-end',
    maxWidth: '92%',
  },
  pillStoreIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pillBranchName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#1E293B',
    flexShrink: 1,
    marginRight: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  pillStatusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    marginRight: 2,
  },
  greetingMedium: {
    fontFamily: 'Modulus-Medium',
    fontWeight: 'normal',
    fontSize: 22,
    lineHeight: 26,
    color: '#334155',
  },
  greetingBold: {
    fontFamily: 'Modulus-Bold',
    fontWeight: 'normal',
    color: colors.buttonColor,
    fontSize: 22,
    lineHeight: 26,
  },
  seeAllLink: {
    color: colors.buttonColor,
  },
});

