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
    return 'P0.00'
  }
  return `PHP${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const Categories = () => {
  const { category: initialCategoryLabel, categoryId: initialCategoryId } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const { selectedPharmacy } = useSelectionPhase()
  const selectedPharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null
  const { toast, showError } = useToast()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const normalizedInitialId = (initialCategoryId && String(initialCategoryId) !== 'null' && String(initialCategoryId) !== 'undefined') ? initialCategoryId : null
  const [selectedCategoryId, setSelectedCategoryId] = useState(normalizedInitialId)
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState(initialCategoryLabel || 'All')

  // Update selected category if navigation params change
  useEffect(() => {
    const validId = (initialCategoryId && String(initialCategoryId) !== 'null' && String(initialCategoryId) !== 'undefined') ? initialCategoryId : null
    setSelectedCategoryId(validId)
    setSelectedCategoryLabel(initialCategoryLabel || 'All')
  }, [initialCategoryId, initialCategoryLabel])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Pagination
  const [nextCursor, setNextCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const isFetchingMoreRef = useRef(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sortVisible, setSortVisible] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [selectedSort, setSelectedSort] = useState(null)
  const [filters, setFilters] = useState({})

  // Fetch Categories once
  useEffect(() => {
    if (!selectedPharmacyId) return
    
    getPharmacyCategories(selectedPharmacyId).then(payload => {
      setCategories(normalizeApiList(payload))
    }).catch(() => {
      setCategories([])
    })
  }, [selectedPharmacyId])

  // Initial products load and reload on filter/category change
  const loadInitialProducts = useCallback(async (refresh = false) => {
    if (!selectedPharmacyId) return

    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const payload = await getProducts(selectedPharmacyId, selectedCategoryId, {
        perPage: PRODUCTS_PER_PAGE,
        ...filters,
        sort: selectedSort
      })

      setProducts(normalizeApiList(payload))
      setNextCursor(payload?.next_cursor ?? null)
      setHasMore(payload?.has_more ?? false)
    } catch (error) {
      setProducts([])
      setNextCursor(null)
      setHasMore(false)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [selectedPharmacyId, selectedCategoryId, filters, selectedSort])

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
        onAddToCart={handleAddToCart}
        style={{ width: '100%' }}
      />
    </View>
  )

  const ListHeader = () => (
    <View style={{ zIndex: 100 }}>
      <Text className="text-2xl px-5 pt-5 pb-2" style={styles.titleBold}>
        {selectedCategoryLabel === 'All' ? 'All Products' : selectedCategoryLabel}
      </Text>

      <View className="flex-row items-center px-5 pb-4 pt-2" style={{ zIndex: 110 }}>
        <TouchableOpacity
          className="w-[42px] h-[42px] rounded-xl bg-white items-center justify-center shadow-lg"
          onPress={() => setFilterVisible(true)}
        >
          <FilterIcon width={22} height={22} />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[42px] h-[42px] rounded-xl bg-white items-center justify-center ml-2.5 shadow-lg"
          onPress={() => setSortVisible(true)}
        >
          <SortIcon width={22} height={22} />
        </TouchableOpacity>

        <View className="flex-1 ml-3" style={{ zIndex: 120 }}>
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white rounded-xl h-[42px] px-4 shadow-lg border border-gray-100"
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text className="text-[14px] text-center" style={[styles.fontMedium, { color: '#48AAD9' }]} numberOfLines={1}>
              {selectedCategoryLabel === 'All' ? 'All Categories' : selectedCategoryLabel}
            </Text>
          </TouchableOpacity>

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
        </View>
      </View>
      {isLoading && (
        <SkeletonCategoryGrid count={6} />
      )}
    </View>
  )

  const ListFooter = () => {
    if (!isFetchingMore) return <View className="h-10" />
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#48AAD9" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#F1F4FF]">
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={insets.top + 8}
      />
      
      <FlatList
        data={products}
        keyExtractor={(item, index) => `${item?.id ?? 'product'}-${index}`}
        renderItem={renderProductItem}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListHeaderComponentStyle={{ zIndex: 9999, elevation: 9999, overflow: 'visible' }}
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
      />

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
