import { Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ProductCard from '@src/shared/components/ProductCard'
import { useSelectionPhase } from '@src/shared/SelectionPhaseContext'
import { getPharmacyCategories, getProducts } from '@src/shared/services/productService'
import { addPharmacyProductToCart } from '@shared/utils/cartUtils'
import ToastMessage from '@shared/components/ToastMessage'
import { useToast } from '@shared/hooks/useToast'
import { CATEGORY_ICONS } from '@src/utils/categoryUtils'

const PRODUCTS_PER_PAGE = 20

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
    return 'P0.00'
  }

  return `P${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const Shop = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { selectedPharmacy } = useSelectionPhase()
  const selectedPharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast, showSuccess, showError } = useToast()

  // Pagination state
  const [nextCursor, setNextCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const isFetchingMoreRef = useRef(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  useEffect(() => {
    if (!selectedPharmacyId) {
      setCategories([])
      setProducts([])
      setNextCursor(null)
      setHasMore(false)
      setIsLoading(false)
      return
    }

    let mounted = true

    async function loadShopData() {
      setIsLoading(true)
      setNextCursor(null)
      setHasMore(false)

      try {
        const [categoriesPayload, productsPayload] = await Promise.all([
          getPharmacyCategories(selectedPharmacyId),
          getProducts(selectedPharmacyId, null, { perPage: PRODUCTS_PER_PAGE }),
        ])

        if (!mounted) {
          return
        }

        setCategories(normalizeApiList(categoriesPayload))
        setProducts(normalizeApiList(productsPayload))
        setNextCursor(productsPayload?.next_cursor ?? null)
        setHasMore(productsPayload?.has_more ?? false)
      } catch (error) {
        if (mounted) {
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
      setProducts((prev) => [...prev, ...newItems])
      setNextCursor(productsPayload?.next_cursor ?? null)
      setHasMore(productsPayload?.has_more ?? false)
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
        onAddToCart={handleAddToCart}
        style={{ width: 160 }}
      />
    </View>
  ), [selectedPharmacyId, handleAddToCart])

  const ListHeader = useCallback(() => (
    <View>
      <View>
        <Text className="text-2xl p-5" style={{ fontFamily: 'Poppins-Bold', color: '#444' }}>
          Categories
        </Text>
        <View className="flex-row flex-wrap px-4">
          {isLoading && (
            Array.from({ length: 8 }).map((_, index) => (
              <View key={`category-skeleton-${index}`} className="w-1/4 items-center mb-4 px-1">
                <CategorySkeletonCard />
              </View>
            ))
          )}

          {!isLoading && categories.map((cat, index) => {
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
  ), [isLoading, categories, selectedPharmacyId])

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
        data={isLoading ? [] : products}
        keyExtractor={(item, index) => `${item?.id ?? 'product'}-${index}`}
        renderItem={renderProductItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ backgroundColor: 'white' }}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={ListEmpty}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
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
    <View className="rounded-2xl border border-gray-200 p-3 bg-white" style={{ width: 160 }}>
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

