import { Text, View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import FilterIcon from '@assets/icons/filter_icon.svg'
import SortIcon from '@assets/icons/sort_icon.svg'
import ProductCard from '@src/shared/components/ProductCard'
import SortOverlay from '@src/shared/components/SortOverlay'
import FilterOverlay from '@src/shared/components/FilterOverlay'
import { useSelectionPhase } from '@shared/context/SelectionPhaseContext'
import { getPharmacyCategories, getProducts } from '@src/shared/services/productService'
import { addPharmacyProductToCart } from '@shared/utils/cartUtils'
import { useToast } from '@shared/hooks/useToast'
import ToastMessage from '@shared/components/ToastMessage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { toTitleCase } from '@shared/utils/stringUtils'
import SkeletonCategoryGrid from '@src/shared/components/SkeletonCategoryGrid'
import { Modal, Pressable } from 'react-native'

const PRODUCTS_PER_PAGE = 20

function normalizeApiList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }
  if (Array.isArray(payload?.data)) {
    return payload.data
  }
  return []
}

function formatPrice(value) {
  const amount = Number(value ?? 0)
  if (Number.isNaN(amount)) {
    return 'PHP 0.00'
  }
  return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const categoryCache = {
  key: null,
  categories: [],
  products: [],
  nextCursor: null,
  hasMore: false,
  timestamp: 0,
  scrollOffset: 0,
}

const Categories = () => {
  const { category: initialCategoryLabel, categoryId: initialCategoryId } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef(null)
  const { selectedPharmacy } = useSelectionPhase()
  const selectedPharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null
  const { toast, showError } = useToast()

  const normalizedInitialId = (initialCategoryId && String(initialCategoryId) !== 'null' && String(initialCategoryId) !== 'undefined') ? initialCategoryId : null
  const [selectedCategoryId, setSelectedCategoryId] = useState(normalizedInitialId)
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState(initialCategoryLabel || 'All')

  const [sortVisible, setSortVisible] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [selectedSort, setSelectedSort] = useState(null)
  const [filters, setFilters] = useState({})

  const cacheKey = `${selectedPharmacyId}_${selectedCategoryId}_${selectedSort}_${JSON.stringify(filters)}`
  const isCached = Boolean(
    categoryCache.key === cacheKey &&
    categoryCache.products.length > 0
  )

  const [categories, setCategories] = useState(categoryCache.categories?.length > 0 ? categoryCache.categories : [])
  const [products, setProducts] = useState(isCached ? categoryCache.products : [])
  const [isLoading, setIsLoading] = useState(!isCached && Boolean(selectedPharmacyId))
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Pagination
  const [nextCursor, setNextCursor] = useState(isCached ? categoryCache.nextCursor : null)
  const [hasMore, setHasMore] = useState(isCached ? categoryCache.hasMore : false)
  const isFetchingMoreRef = useRef(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Update selected category if navigation params change
  useEffect(() => {
    const validId = (initialCategoryId && String(initialCategoryId) !== 'null' && String(initialCategoryId) !== 'undefined') ? initialCategoryId : null
    setSelectedCategoryId(validId)
    setSelectedCategoryLabel(initialCategoryLabel || 'All')
  }, [initialCategoryId, initialCategoryLabel])

  // Restore scroll position
  useEffect(() => {
    if (categoryCache.scrollOffset > 0 && categoryCache.key === cacheKey) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: categoryCache.scrollOffset,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [cacheKey]);

  // Fetch Categories once
  useEffect(() => {
    if (!selectedPharmacyId) return
    
    getPharmacyCategories(selectedPharmacyId).then(payload => {
      const cats = normalizeApiList(payload)
      setCategories(cats)
      categoryCache.categories = cats
    }).catch(() => {
      setCategories([])
    })
  }, [selectedPharmacyId])

  // Initial products load and reload on filter/category change
  const loadInitialProducts = useCallback(async (refresh = false) => {
    if (!selectedPharmacyId) return

    const currentKey = `${selectedPharmacyId}_${selectedCategoryId}_${selectedSort}_${JSON.stringify(filters)}`
    const isCacheFresh = Boolean(
      categoryCache.key === currentKey &&
      categoryCache.timestamp &&
      (Date.now() - categoryCache.timestamp < 60000) &&
      categoryCache.products.length > 0
    )

    if (isCacheFresh && !refresh) {
      return
    }

    if (refresh) {
      setIsRefreshing(true)
    } else if (!isCached) {
      setIsLoading(true)
      setProducts([])
    }

    try {
      const payload = await getProducts(selectedPharmacyId, selectedCategoryId, {
        perPage: PRODUCTS_PER_PAGE,
        ...filters,
        sort: selectedSort
      })

      const normProds = normalizeApiList(payload)
      const newCursor = payload?.next_cursor ?? null
      const newHasMore = payload?.has_more ?? false

      setProducts(normProds)
      setNextCursor(newCursor)
      setHasMore(newHasMore)

      categoryCache.key = currentKey
      categoryCache.products = normProds
      categoryCache.nextCursor = newCursor
      categoryCache.hasMore = newHasMore
      categoryCache.timestamp = Date.now()
    } catch (error) {
      if (!isCached) {
        setProducts([])
        setNextCursor(null)
        setHasMore(false)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedPharmacyId, selectedCategoryId, filters, selectedSort, isCached])

  useEffect(() => {
    loadInitialProducts()
  }, [loadInitialProducts])

  const loadMoreProducts = async () => {
    if (isFetchingMoreRef.current || !hasMore || !nextCursor || !selectedPharmacyId) {
      return
    }

    isFetchingMoreRef.current = true
    setIsFetchingMore(true)

    try {
      const payload = await getProducts(selectedPharmacyId, selectedCategoryId, {
        cursor: nextCursor,
        perPage: PRODUCTS_PER_PAGE,
        ...filters,
        sort: selectedSort
      })

      const newItems = normalizeApiList(payload)
      setProducts((prev) => [...prev, ...newItems])
      setNextCursor(payload?.next_cursor ?? null)
      setHasMore(payload?.has_more ?? false)
    } catch (error) {
      // ignore
    } finally {
      isFetchingMoreRef.current = false
      setIsFetchingMore(false)
    }
  }

  const handleAddToCart = ({ pharmacyProductId, quantity = 1 }) => {
    return addPharmacyProductToCart({
      pharmacyId: selectedPharmacyId,
      pharmacyProductId,
      quantity,
      validationMessages: {
        missingPharmacy: 'Please select a pharmacy and try again.',
        missingProduct: 'Please select a pharmacy and try again.',
      },
    }).then((result) => {
      if (!result.ok) {
        showError(result.errorMessage)
      }
      return result
    })
  }

  const renderProductItem = ({ item }) => (
    <View className="w-1/2 px-1 mb-4">
      <ProductCard
        productId={String(item?.product_id ?? '')}
        pharmacyProductId={item?.id}
        pharmacyId={selectedPharmacyId}
        img={item?.product?.image_url}
        product={item?.product}
        categoryName={item?.category?.category_name}
        description={item?.product?.product_name || 'Unnamed product'}
        category={item?.category?.category_name || 'Uncategorized'}
        price={formatPrice(item?.selling_price)}
        isPrescribed={Boolean(Number(item?.product?.is_prescribed))}
        isAvailable={
          item?.is_available == null
            ? true
            : (typeof item?.is_available === 'boolean'
              ? item.is_available
              : Number(item.is_available) === 1)
        }
        isOutOfStock={Boolean(item?.is_out_of_stock) || (item?.stock !== undefined && Number(item?.stock) <= 0)}
        stock={item?.stock}
        onAddToCart={handleAddToCart}
        style={{ width: '100%' }}
      />
    </View>
  )

  const hasPriceFilter = (filters?.priceMin !== undefined && filters?.priceMin > 0) || (filters?.priceMax !== undefined && filters?.priceMax < 5000)
  const priceLabel = `₱${filters?.priceMin ?? 0} - ₱${filters?.priceMax !== undefined && filters?.priceMax < 5000 ? filters.priceMax : '5k+'}`

  const hasActiveFilters = Boolean(
    filters?.availability ||
    filters?.prescriptionType ||
    hasPriceFilter ||
    (filters?.brands && filters?.brands?.length > 0)
  )

  const handleRemoveSort = useCallback(() => {
    setSelectedSort(null)
  }, [])

  const handleRemoveAvailability = useCallback(() => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next.availability
      return next
    })
  }, [])

  const handleRemovePrescription = useCallback(() => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next.prescriptionType
      return next
    })
  }, [])

  const handleRemovePrice = useCallback(() => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next.priceMin
      delete next.priceMax
      return next
    })
  }, [])

  const handleRemoveBrands = useCallback(() => {
    setFilters((prev) => {
      const next = { ...prev }
      delete next.brands
      return next
    })
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setFilters({})
    setSelectedSort(null)
  }, [])

  const currentTitle = selectedSort
    ? selectedSort
    : (selectedCategoryLabel === 'All' ? 'All Products' : selectedCategoryLabel)

  const ListEmpty = () => {
    if (isLoading) return null
    return (
      <View className="py-16 items-center justify-center px-6">
        <Text className="text-base text-gray-500 text-center" style={styles.fontMedium}>
          No products found matching the selected criteria.
        </Text>
        {(hasActiveFilters || selectedSort) && (
          <TouchableOpacity
            onPress={handleClearAllFilters}
            className="mt-3 px-4 py-2 bg-[#48AAD9] rounded-xl"
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-white text-xs" style={styles.fontMedium}>
              Clear Filters & Sort
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const ListFooter = () => {
    if (!isFetchingMore) return <View className="h-10" />
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#48AAD9" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={insets.top + 8}
      />

      {/* Screen Header & Filter/Sort Controls */}
      <View className="bg-white">
        <Text className="text-2xl px-5 pt-5 pb-2" style={styles.titleBold}>
          {currentTitle}
        </Text>

        <View className="flex-row items-center px-5 pb-3 pt-1">
          <TouchableOpacity
            className={`w-[42px] h-[42px] rounded-xl items-center justify-center shadow-lg ${hasActiveFilters ? 'bg-[#E8F4FA] border border-[#48AAD9]' : 'bg-white'}`}
            onPress={() => setFilterVisible(true)}
            activeOpacity={0.7}
          >
            <FilterIcon width={22} height={22} />
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[42px] h-[42px] rounded-xl items-center justify-center ml-2.5 shadow-lg ${selectedSort ? 'bg-[#E8F4FA] border border-[#48AAD9]' : 'bg-white'}`}
            onPress={() => setSortVisible(true)}
            activeOpacity={0.7}
          >
            <SortIcon width={22} height={22} />
          </TouchableOpacity>

          <View className="flex-1 ml-3">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white rounded-xl h-[42px] px-4 shadow-lg border border-gray-100"
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.7}
            >
              <Text className="text-[14px] text-center" style={[styles.fontMedium, { color: '#48AAD9' }]} numberOfLines={1}>
                {selectedCategoryLabel === 'All' ? 'All Categories' : selectedCategoryLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active filter and sort chips */}
        {(hasActiveFilters || selectedSort) && (
          <View className="flex-row flex-wrap items-center px-5 pb-3 gap-1.5">
            {Boolean(selectedSort) && (
              <TouchableOpacity
                onPress={handleRemoveSort}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center bg-[#E8F4FA] border border-[#48AAD9] rounded-full pl-3 pr-2 py-1"
              >
                <Text className="text-xs text-[#48AAD9] mr-1.5" style={styles.fontMedium}>
                  {selectedSort}
                </Text>
                <View className="w-4 h-4 rounded-full bg-[#48AAD9]/20 items-center justify-center">
                  <Text className="text-[10px] text-[#48AAD9] font-bold leading-none">✕</Text>
                </View>
              </TouchableOpacity>
            )}

            {Boolean(filters?.availability) && (
              <TouchableOpacity
                onPress={handleRemoveAvailability}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center bg-[#E8F4FA] border border-[#48AAD9] rounded-full pl-3 pr-2 py-1"
              >
                <Text className="text-xs text-[#48AAD9] mr-1.5" style={styles.fontMedium}>
                  {filters.availability}
                </Text>
                <View className="w-4 h-4 rounded-full bg-[#48AAD9]/20 items-center justify-center">
                  <Text className="text-[10px] text-[#48AAD9] font-bold leading-none">✕</Text>
                </View>
              </TouchableOpacity>
            )}

            {Boolean(filters?.prescriptionType) && (
              <TouchableOpacity
                onPress={handleRemovePrescription}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center bg-[#E8F4FA] border border-[#48AAD9] rounded-full pl-3 pr-2 py-1"
              >
                <Text className="text-xs text-[#48AAD9] mr-1.5" style={styles.fontMedium}>
                  {filters.prescriptionType}
                </Text>
                <View className="w-4 h-4 rounded-full bg-[#48AAD9]/20 items-center justify-center">
                  <Text className="text-[10px] text-[#48AAD9] font-bold leading-none">✕</Text>
                </View>
              </TouchableOpacity>
            )}

            {hasPriceFilter && (
              <TouchableOpacity
                onPress={handleRemovePrice}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center bg-[#E8F4FA] border border-[#48AAD9] rounded-full pl-3 pr-2 py-1"
              >
                <Text className="text-xs text-[#48AAD9] mr-1.5" style={styles.fontMedium}>
                  {priceLabel}
                </Text>
                <View className="w-4 h-4 rounded-full bg-[#48AAD9]/20 items-center justify-center">
                  <Text className="text-[10px] text-[#48AAD9] font-bold leading-none">✕</Text>
                </View>
              </TouchableOpacity>
            )}

            {Boolean(filters?.brands?.length) && (
              <TouchableOpacity
                onPress={handleRemoveBrands}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="flex-row items-center bg-[#E8F4FA] border border-[#48AAD9] rounded-full pl-3 pr-2 py-1"
              >
                <Text className="text-xs text-[#48AAD9] mr-1.5" style={styles.fontMedium}>
                  {filters.brands.join(', ')}
                </Text>
                <View className="w-4 h-4 rounded-full bg-[#48AAD9]/20 items-center justify-center">
                  <Text className="text-[10px] text-[#48AAD9] font-bold leading-none">✕</Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleClearAllFilters}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="px-2 py-1 justify-center"
            >
              <Text className="text-xs text-gray-500 underline" style={styles.fontMedium}>
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Category Dropdown Modal */}
      <Modal visible={dropdownOpen} transparent animationType="fade" onRequestClose={() => setDropdownOpen(false)}>
        <Pressable className="flex-1 bg-black/30 justify-center items-center px-6" onPress={() => setDropdownOpen(false)}>
          <Pressable className="bg-white rounded-2xl p-4 w-full max-h-[60%]" onPress={(e) => e.stopPropagation()}>
            <Text className="text-base mb-3 px-1" style={[styles.titleBold, { color: '#48AAD9' }]}>Select Category</Text>
            <ScrollView showsVerticalScrollIndicator={true} style={{ maxHeight: 320 }}>
              <TouchableOpacity
                className={`px-3.5 py-3 rounded-xl mb-1 ${selectedCategoryId === null ? 'bg-[#E8F4FA]' : ''}`}
                onPress={() => {
                  setSelectedCategoryId(null)
                  setSelectedCategoryLabel('All')
                  setDropdownOpen(false)
                }}
              >
                <Text style={selectedCategoryId === null ? styles.dropdownActive : styles.dropdownInactive}>All Categories</Text>
              </TouchableOpacity>
              {!isLoading && selectedPharmacyId && categories.length === 0 && (
                <Text className="px-1 py-2 text-center" style={{ fontFamily: 'Poppins-Medium', color: '#6B7280' }}>
                  No categories found for this pharmacy.
                </Text>
              )}
              {categories.map((cat) => {
                const label = toTitleCase(cat?.category_name)
                const isActive = String(cat.id) === String(selectedCategoryId)
                return (
                  <TouchableOpacity
                    key={cat.id}
                    className={`px-3.5 py-3 rounded-xl mb-1 ${isActive ? 'bg-[#E8F4FA]' : ''}`}
                    onPress={() => {
                      setSelectedCategoryId(cat.id)
                      setSelectedCategoryLabel(label)
                      setDropdownOpen(false)
                    }}
                  >
                    <Text style={isActive ? styles.dropdownActive : styles.dropdownInactive}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Product List or Skeleton */}
      {isLoading && products.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <SkeletonCategoryGrid count={6} />
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={products}
          keyExtractor={(item, index) => `${item?.id ?? 'product'}-${index}`}
          renderItem={renderProductItem}
          numColumns={2}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          columnWrapperStyle={{ paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadInitialProducts(true)}
              colors={['#48AAD9']}
              tintColor="#48AAD9"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ backgroundColor: 'white', flexGrow: 1 }}
          onScroll={(e) => {
            const y = e.nativeEvent?.contentOffset?.y ?? 0
            if (y >= 0) {
              categoryCache.scrollOffset = y
            }
          }}
          scrollEventThrottle={16}
          contentOffset={{ x: 0, y: (categoryCache.key === cacheKey ? categoryCache.scrollOffset : 0) || 0 }}
        />
      )}

      <SortOverlay
        visible={sortVisible}
        onClose={() => setSortVisible(false)}
        selected={selectedSort}
        onSelect={(option) => {
          setSelectedSort(option)
          setSortVisible(false)
        }}
      />

      <FilterOverlay
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters)
          setFilterVisible(false)
        }}
      />
    </View>
  )
}


export default Categories

const styles = StyleSheet.create({
  titleBold: {
    fontFamily: 'Poppins-Bold',
    color: '#444',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  dropdownActive: {
    fontFamily: 'Poppins-SemiBold',
    color: '#48AAD9',
  },
  dropdownInactive: {
    fontFamily: 'Poppins-Medium',
    color: '#444',
  },
})
