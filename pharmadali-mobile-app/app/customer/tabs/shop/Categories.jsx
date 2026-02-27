import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import FilterIcon from '@assets/icons/filter_icon.svg'
import SortIcon from '@assets/icons/sort_icon.svg'
import ArrowDropDownIcon from '@assets/icons/arrow_drop_down_icon.svg'
import ProductCard from '@shared/components/ProductCard'
import SortOverlay from '@shared/components/SortOverlay'
import FilterOverlay from '@shared/components/FilterOverlay'
import BandaidImg from '@assets/images/bandaid_img.png'
import BetadineImg from '@assets/images/betadine_img.png'

const categoryOptions = [
  'All',
  'Prescription Medicines',
  'Over-the-Counter',
  'Vitamins & Supplements',
  'Baby & Kids',
  'Personal Care',
  'Medical Supplies',
  'Chronic Care',
  'Mother and Reproductive',
]

const dummyProducts = [
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
]

const Categories = () => {
  const { category } = useLocalSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(category || 'All')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [sortVisible, setSortVisible] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [selectedSort, setSelectedSort] = useState(null)
  const [filters, setFilters] = useState({})

  return (
    <ScrollView className="flex-1 bg-[#F1F4FF]" showsVerticalScrollIndicator={false}>
      <Text className="text-2xl px-5 pt-5 pb-2" style={styles.titleBold}>
        {selectedCategory === 'All' ? 'All Products' : selectedCategory}
      </Text>

      <View className="flex-row items-center px-5 pb-4 pt-2">
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

        <View className="flex-1 ml-3">
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-lg px-3 py-2.5 shadow-lg"
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text className="text-[13px] text-gray-400 flex-1" style={styles.fontMedium} numberOfLines={1}>
              {selectedCategory === 'All' ? 'Select a category' : selectedCategory}
            </Text>
            <ArrowDropDownIcon width={20} height={20} />
          </TouchableOpacity>

          {dropdownOpen && (
            <View className="absolute top-[46px] left-0 right-0 bg-white rounded-lg border border-gray-300 z-50 shadow-md" style={{ elevation: 5 }}>
              {categoryOptions.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  className={`px-3.5 py-2.5 ${selectedCategory === cat ? 'bg-[#E8F4FA]' : ''}`}
                  onPress={() => {
                    setSelectedCategory(cat)
                    setDropdownOpen(false)
                  }}
                >
                  <Text
                    className="text-[13px]"
                    style={selectedCategory === cat ? styles.dropdownActive : styles.dropdownInactive}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View className="flex-row flex-wrap px-4 pb-6">
        {dummyProducts.map((item, index) => (
          <View key={index} className="w-1/2 px-1 mb-4">
            <ProductCard
              img={item.img}
              description={item.description}
              category={item.category}
              price={item.price}
              style={{ width: '100%' }}
            />
          </View>
        ))}
      </View>

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
        onApply={setFilters}
      />
    </ScrollView>
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