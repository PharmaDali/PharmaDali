import { Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg'
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProductCard from '@src/shared/components/ProductCard'
import { useSelectionPhase } from '@shared/context/SelectionPhaseContext'
import { getPharmacyCategories, getProducts } from '@src/shared/services/productService'
import { addPharmacyProductToCart } from '@shared/utils/cartUtils'
import ToastMessage from '@shared/components/ToastMessage'
import { useToast } from '@shared/hooks/useToast'
import { CATEGORY_ICONS } from '@src/utils/categoryUtils'

const PRODUCTS_PER_PAGE = 30

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

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

export const shopCache = {
  pharmacyId: null,
  categories: [],
  products: [],
  nextCursor: null,
  hasMore: false,
  categoriesExpanded: false,
  timestamp: 0,
  scrollOffset: 0,
}

const Shop = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef(null)
  const { selectedPharmacy } = useSelectionPhase()
  const selectedPharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null
  const { expandCategories } = useLocalSearchParams()

  const isCached = Boolean(
    selectedPharmacyId &&
    shopCache.pharmacyId === selectedPharmacyId &&
    shopCache.products.length > 0
  )

  const [categories, setCategories] = useState(isCached ? shopCache.categories : [])
  const [categoriesExpanded, setCategoriesExpanded] = useState(
    expandCategories === 'true' ? true : (isCached ? shopCache.categoriesExpanded : false)
  )
  const [products, setProducts] = useState(isCached ? shopCache.products : [])
  const [isLoading, setIsLoading] = useState(!isCached && Boolean(selectedPharmacyId))
  const [prevPharmacyId, setPrevPharmacyId] = useState(selectedPharmacyId)

  // Pagination state
  const [nextCursor, setNextCursor] = useState(isCached ? shopCache.nextCursor : null)
  const [hasMore, setHasMore] = useState(isCached ? shopCache.hasMore : false)
  const isFetchingMoreRef = useRef(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Immediately clear products & display skeletons when pharmacy changes
  if (selectedPharmacyId !== prevPharmacyId) {
    setPrevPharmacyId(selectedPharmacyId)
    shopCache.pharmacyId = null
    shopCache.products = []
    shopCache.categories = []
    shopCache.scrollOffset = 0
    setIsLoading(true)
    setCategories([])
    setProducts([])
    setNextCursor(null)
    setHasMore(false)
  }

  // Restore scroll position
  useEffect(() => {
    if (shopCache.scrollOffset > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: shopCache.scrollOffset,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  const { toast, showSuccess, showError } = useToast()

  useEffect(() => {
    if (!selectedPharmacyId) {
      setCategories([])
      setProducts([])
      setNextCursor(null)
      setHasMore(false)
      setIsLoading(false)
      return
    }

    const isCacheFresh = Boolean(
      shopCache.pharmacyId === selectedPharmacyId &&
      shopCache.timestamp &&
      (Date.now() - shopCache.timestamp < 60000) &&
      shopCache.products.length > 0
    )

    if (isCacheFresh) {
      return
    }

    let mounted = true

    async function loadShopData() {
      if (!isCached) {
        setIsLoading(true)
      }

      try {
        const [categoriesPayload, productsPayload] = await Promise.all([
          getPharmacyCategories(selectedPharmacyId),
          getProducts(selectedPharmacyId, null, { perPage: PRODUCTS_PER_PAGE }),
        ])

        if (!mounted) {
          return
        }

        const normCats = normalizeApiList(categoriesPayload)
        const normProds = normalizeApiList(productsPayload)
        const newCursor = productsPayload?.next_cursor ?? null
        const newHasMore = productsPayload?.has_more ?? false

        setCategories(normCats)
        setProducts(normProds)
        setNextCursor(newCursor)
        setHasMore(newHasMore)

        shopCache.pharmacyId = selectedPharmacyId
        shopCache.categories = normCats
        shopCache.products = normProds
        shopCache.nextCursor = newCursor
        shopCache.hasMore = newHasMore
        shopCache.categoriesExpanded = categoriesExpanded
        shopCache.timestamp = Date.now()
      } catch (error) {
        if (mounted && !isCached) {
          setCategories([])
          setProducts([])
          setNextCursor(null)
          setHasMore(false)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadShopData()

    return () => {
      mounted = false
    }
  }, [selectedPharmacyId])

  const loadMoreProducts = useCallback(async () => {
    if (isFetchingMoreRef.current || !hasMore || !nextCursor || !selectedPharmacyId) {
      return
    }

    isFetchingMoreRef.current = true
    setIsFetchingMore(true)

    try {
      const productsPayload = await getProducts(selectedPharmacyId, null, {
        cursor: nextCursor,
        perPage: PRODUCTS_PER_PAGE,
      })

      const newItems = normalizeApiList(productsPayload)
      const newCursor = productsPayload?.next_cursor ?? null
      const newHasMore = productsPayload?.has_more ?? false

      setProducts((prev) => {
        const updated = [...prev, ...newItems]
        shopCache.products = updated
        return updated
      })
      setNextCursor(newCursor)
      setHasMore(newHasMore)

      shopCache.nextCursor = newCursor
      shopCache.hasMore = newHasMore
    } catch (error) {
      // Silently fail — user can scroll up and try again
    } finally {
      isFetchingMoreRef.current = false
      setIsFetchingMore(false)
    }
  }, [hasMore, nextCursor, selectedPharmacyId])

  const navigateToCategory = (item) => {
    const rawLabel = item?.category_name || 'Category'
    const label = toTitleCase(rawLabel.trim())
    router.push({
      pathname: '/tabs/shop/Categories',
      params: {
        category: label,
        categoryId: String(item?.id ?? ''),
      },
    })
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

  const renderProductItem = useCallback(({ item, index }) => (
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
  ), [selectedPharmacyId, handleAddToCart])

  const CATEGORIES_PER_ROW = 4

  const ListHeader = useCallback(() => {
    const visibleCategories = categoriesExpanded
      ? categories
      : categories.slice(0, CATEGORIES_PER_ROW)
    const hasMore = categories.length > CATEGORIES_PER_ROW

    return (
      <View>
        <View>
          <Text className="text-2xl p-5" style={{ fontFamily: 'Poppins-Bold', color: '#444' }}>
            Categories
          </Text>
          <View className="flex-row flex-wrap px-4">
            {isLoading && (
              Array.from({ length: 4 }).map((_, index) => (
                <View key={`category-skeleton-${index}`} className="w-1/4 items-center mb-4 px-1">
                  <CategorySkeletonCard />
                </View>
              ))
            )}

            {!isLoading && visibleCategories.map((cat, index) => {
              const rawLabel = cat?.category_name || 'Category'
              const label = toTitleCase(rawLabel.trim())
              const IconComponent = CATEGORY_ICONS[label]

              return (
                <CategoryCard
                  key={cat?.id || index}
                  icon={IconComponent ? <IconComponent width={24} height={24} /> : <Text className="text-2xl">🛍️</Text>}
                  label={label}
                  onPress={() => navigateToCategory(cat)}
                />
              )
            })}

            {!isLoading && selectedPharmacyId && categories.length === 0 && (
              <Text className="px-1" style={{ fontFamily: 'Poppins-Medium', color: '#6B7280' }}>
                No categories found for this pharmacy.
              </Text>
            )}
          </View>

          {!isLoading && hasMore && (
            <TouchableOpacity
              onPress={() => setCategoriesExpanded(prev => !prev)}
              className="flex-row items-center justify-center pb-3 gap-1"
            >
              <Text className="text-sm" style={{ fontFamily: 'Poppins-SemiBold', color: '#48AAD9' }}>
                {categoriesExpanded ? 'See less' : 'See all'}
              </Text>
              {categoriesExpanded
                ? <ArrowUpIcon width={16} height={16} color="#48AAD9" />
                : <ArrowDownIcon width={16} height={16} color="#48AAD9" />
              }
            </TouchableOpacity>
          )}
        </View>

        <View>
          <Text className="text-2xl p-5" style={{ fontFamily: 'Poppins-Bold', color: '#444' }}>
            Products
          </Text>
        </View>

        {isLoading && (
          <View className="flex-row flex-wrap px-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={`skeleton-${index}`} className="w-1/2 px-1 mb-4">
                <ProductSkeletonCard />
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }, [isLoading, categories, selectedPharmacyId, categoriesExpanded])

  const ListFooter = useCallback(() => {
    if (!isFetchingMore) return null

    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#48AAD9" />
        <Text className="mt-2 text-xs" style={{ fontFamily: 'Poppins-Medium', color: '#9CA3AF' }}>
          Loading more products...
        </Text>
      </View>
    )
  }, [isFetchingMore])

  const ListEmpty = useCallback(() => {
    if (isLoading) return null

    if (!selectedPharmacyId) return null

    return (
      <View className="px-5">
        <Text style={{ fontFamily: 'Poppins-Medium', color: '#6B7280' }}>
          No products found for this pharmacy.
        </Text>
      </View>
    )
  }, [isLoading, selectedPharmacyId])

  return (
    <View className="flex-1 bg-white">
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={insets.top + 8}
      />
      <FlatList
        ref={flatListRef}
        data={isLoading && !isCached ? [] : products}
        keyExtractor={(item, index) => `${item?.id ?? 'product'}-${index}`}
        renderItem={renderProductItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: 'white', paddingBottom: Math.max(insets.bottom, 16) + 80 }}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        onScroll={(e) => {
          const y = e.nativeEvent?.contentOffset?.y ?? 0
          if (y >= 0) {
            shopCache.scrollOffset = y
          }
        }}
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: shopCache.scrollOffset || 0 }}
      />
    </View>
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

function ProductSkeletonCard() {
  return (
    <View className="w-full rounded-2xl border border-gray-200 p-3 bg-white">
      <View className="h-24 rounded-xl bg-gray-200" />
      <View className="h-3 mt-3 rounded bg-gray-200" />
      <View className="h-3 mt-2 w-3/4 rounded bg-gray-200" />
      <View className="h-3 mt-3 w-1/2 rounded bg-gray-200" />
    </View>
  )
}

function CategorySkeletonCard() {
  return (
    <View className="w-20 h-20 bg-gray-200 rounded-lg" />
  )
}

export default Shop

