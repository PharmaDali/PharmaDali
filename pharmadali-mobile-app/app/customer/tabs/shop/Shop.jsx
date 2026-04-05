import { Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import BandaidImg from '@assets/images/bandaid_img.png'
import ProductCard from '@src/shared/components/ProductCard'
import { useSelectionPhase } from '@src/shared/SelectionPhaseContext'
import { getBranchCategories, getProducts } from '@src/shared/services/productService'

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
  const { selectedBranch } = useSelectionPhase()
  const selectedBranchId = selectedBranch?.id ?? selectedBranch?.branch_id ?? null
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!selectedBranchId) {
      setCategories([])
      setProducts([])
      setIsLoading(false)
      return
    }

    let mounted = true

    async function loadShopData() {
      setIsLoading(true)

      try {
        const [categoriesPayload, productsPayload] = await Promise.all([
          getBranchCategories(selectedBranchId),
          getProducts(selectedBranchId),
        ])

        if (!mounted) {
          return
        }

        setCategories(normalizeApiList(categoriesPayload))
        setProducts(normalizeApiList(productsPayload))
      } catch (error) {
        if (mounted) {
          setCategories([])
          setProducts([])
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
  }, [selectedBranchId])

  const navigateToCategory = (item) => {
    router.push({
      pathname: '/customer/tabs/shop/Categories',
      params: {
        category: item?.category_name || 'Category',
        categoryId: String(item?.id ?? ''),
      },
    })
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
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

          {!isLoading && categories.map((cat, index) => (
            <CategoryCard
              key={cat?.id || index}
              icon={<Text>🛍️</Text>}
              label={cat?.category_name || 'Category'}
              onPress={() => navigateToCategory(cat)}
            />
          ))}

          {!isLoading && selectedBranchId && categories.length === 0 && (
            <Text className="px-1" style={{ fontFamily: 'Poppins-Medium', color: '#6B7280' }}>
              No categories found for this branch.
            </Text>
          )}
        </View>
      </View>

      <View>
        <Text className="text-2xl p-5" style={{ fontFamily: 'Poppins-Bold', color: '#444' }}>
          Products
        </Text>
      </View>
      <View className="flex-row flex-wrap px-4">
        {isLoading && (
          Array.from({ length: 4 }).map((_, index) => (
            <View key={`skeleton-${index}`} className="w-1/2 px-1 mb-4">
              <ProductSkeletonCard />
            </View>
          ))
        )}

        {!isLoading && products.map((item, index) => (
          <View key={index} className="w-1/2 px-1 mb-4">
            <ProductCard
              productId={String(item?.product_id ?? '')}
              img={BandaidImg}
              description={item?.product?.product_name || 'Unnamed product'}
              category={item?.category?.category_name || 'Uncategorized'}
              price={formatPrice(item?.selling_price)}
              style={{ width: 160 }}
            />
          </View>
        ))}

        {!isLoading && selectedBranchId && products.length === 0 && (
          <Text className="px-1" style={{ fontFamily: 'Poppins-Medium', color: '#6B7280' }}>
            No products found for this branch.
          </Text>
        )}
      </View>
    </ScrollView>
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
