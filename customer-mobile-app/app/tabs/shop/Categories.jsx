import { Text, View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import FilterIcon from '@assets/icons/filter_icon.svg'
import SortIcon from '@assets/icons/sort_icon.svg'
import ArrowDropDownIcon from '@assets/icons/arrow_drop_down_icon.svg'
import ProductCard from '@src/shared/components/ProductCard'
import SortOverlay from '@src/shared/components/SortOverlay'
import FilterOverlay from '@src/shared/components/FilterOverlay'
import { useSelectionPhase } from '@src/shared/SelectionPhaseContext'
import { getBranchCategories, getProducts } from '@src/shared/services/productService'
import { addBranchProductToCart } from '@shared/utils/cartUtils'
import { useToast } from '@shared/hooks/useToast'
import ToastMessage from '@shared/components/ToastMessage'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { toTitleCase } from '@shared/utils/stringUtils'

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
  const { selectedBranch } = useSelectionPhase()
  const selectedBranchId = selectedBranch?.id ?? selectedBranch?.branch_id ?? null
  const { toast, showError } = useToast()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || null)
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState(initialCategoryLabel || 'All')
  
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
    if (!selectedBranchId) return
    
    getBranchCategories(selectedBranchId).then(payload => {
      setCategories(normalizeApiList(payload))
    }).catch(() => {
      setCategories([])
    })
  }, [selectedBranchId])

  // Initial products load and reload on filter/category change
  const loadInitialProducts = useCallback(async (refresh = false) => {
    if (!selectedBranchId) return

    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const payload = await getProducts(selectedBranchId, selectedCategoryId, {
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
  }, [selectedBranchId, selectedCategoryId, filters, selectedSort])

  useEffect(() => {
    loadInitialProducts()
  }, [loadInitialProducts])

  const loadMoreProducts = async () => {
    if (isFetchingMoreRef.current || !hasMore || !nextCursor || !selectedBranchId) {
      return
    }

    isFetchingMoreRef.current = true
    setIsFetchingMore(true)

    try {
      const payload = await getProducts(selectedBranchId, selectedCategoryId, {
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

  const handleAddToCart = ({ branchProductId, quantity = 1 }) => {
    return addBranchProductToCart({
      branchId: selectedBranchId,
      branchProductId,
      quantity,
      validationMessages: {
        missingBranch: 'Please select a branch and try again.',
        missingProduct: 'Please select a branch and try again.',
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
        branchProductId={item?.id}
        branchId={selectedBranchId}
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
            className="flex-row items-center justify-between bg-white rounded-lg px-3 py-2.5 shadow-lg"
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text className="text-[13px] text-gray-400 flex-1" style={styles.fontMedium} numberOfLines={1}>
              {selectedCategoryLabel === 'All' ? 'Select a category' : selectedCategoryLabel}
            </Text>
            <ArrowDropDownIcon width={20} height={20} />
          </TouchableOpacity>

          {dropdownOpen && (
            <View className="absolute top-[46px] left-0 right-0 bg-white rounded-lg border border-gray-300 shadow-md" style={{ elevation: 5, zIndex: 1000 }}>
              <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled={true}>
                <TouchableOpacity
                  className={`px-3.5 py-2.5 ${selectedCategoryId === null ? 'bg-[#E8F4FA]' : ''}`}
                  onPress={() => {
                    setSelectedCategoryId(null)
                    setSelectedCategoryLabel('All')
                    setDropdownOpen(false)
                  }}
                >
                  <Text style={selectedCategoryId === null ? styles.dropdownActive : styles.dropdownInactive}>All</Text>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const label = toTitleCase(cat?.category_name)
                  const isActive = String(cat.id) === String(selectedCategoryId)
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      className={`px-3.5 py-2.5 ${isActive ? 'bg-[#E8F4FA]' : ''}`}
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
            </View>
          )}
        </View>
      </View>
      {isLoading && (
        <View className="px-5 py-10 items-center justify-center">
          <ActivityIndicator size="large" color="#48AAD9" />
        </View>
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
        refreshing={isRefreshing}
        onRefresh={() => loadInitialProducts(true)}
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
