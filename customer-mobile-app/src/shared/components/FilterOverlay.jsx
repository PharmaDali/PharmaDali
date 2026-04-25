import { Text, View, Modal, TouchableOpacity, Pressable, ScrollView, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import Slider from '@react-native-community/slider'

const brands = ['Unilab', 'Cecon', 'RiteMed', 'Others', 'Mediplus']

const availabilityOptions = ['In Stock Only', 'Out of Stock', 'Low Stock']

const prescriptionOptions = ['Prescription Required', 'Over-the-Counter']

function PriceRangeSection({ priceMin, priceMax, setPriceMin, setPriceMax, onReset }) {
  return (
    <>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base" style={styles.titleBold}>Price Range</Text>
        <TouchableOpacity onPress={onReset}>
          <Text className="text-sm" style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-1">
        <Slider
          minimumValue={0}
          maximumValue={500}
          step={10}
          value={priceMin}
          onValueChange={(val) => setPriceMin(Math.min(val, priceMax))}
          minimumTrackTintColor="#48AAD9"
          maximumTrackTintColor="#48AAD9"
          thumbTintColor="#48AAD9"
        />
        <Slider
          minimumValue={0}
          maximumValue={500}
          step={10}
          value={priceMax}
          onValueChange={(val) => setPriceMax(Math.max(val, priceMin))}
          minimumTrackTintColor="#48AAD9"
          maximumTrackTintColor="#D1D5DB"
          thumbTintColor="#48AAD9"
        />
      </View>

      <View className="flex-row items-center justify-center gap-3 mb-6">
        <View className="flex-1 rounded-full border border-gray-300 px-4 py-2">
          <Text className="text-center text-sm" style={styles.textMedium}>₱{Math.round(priceMin)}</Text>
        </View>
        <Text className="text-gray-400" style={styles.fontMedium}>–</Text>
        <View className="flex-1 rounded-full border border-gray-300 px-4 py-2">
          <Text className="text-center text-sm" style={styles.textMedium}>₱{Math.round(priceMax)}</Text>
        </View>
      </View>
    </>
  )
}

function BrandSection({ selectedBrands, toggleBrand }) {
  return (
    <>
      <Text className="text-base mb-3" style={styles.titleBold}>Brand</Text>
      <View className="flex-row flex-wrap gap-x-6 gap-y-2 mb-6">
        {brands.map((brand) => (
          <TouchableOpacity
            key={brand}
            className="flex-row items-center"
            onPress={() => toggleBrand(brand)}
          >
            <View className={`w-5 h-5 rounded border mr-2 items-center justify-center ${selectedBrands.includes(brand) ? 'bg-[#48AAD9] border-[#48AAD9]' : 'border-gray-300 bg-white'}`}>
              {selectedBrands.includes(brand) && (
                <Text className="text-white text-xs">✓</Text>
              )}
            </View>
            <Text className="text-sm" style={styles.textMedium}>{brand}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  )
}

function ChipGroup({ title, options, selected, onSelect }) {
  return (
    <>
      <Text className="text-base mb-3" style={styles.titleBold}>{title}</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {options.map((option) => {
          const isActive = selected === option
          return (
            <TouchableOpacity
              key={option}
              className={`rounded-full border px-4 py-2 ${isActive ? 'bg-[#48AAD9] border-[#48AAD9]' : 'bg-white border-gray-300'}`}
              onPress={() => onSelect(isActive ? null : option)}
            >
              <Text
                className="text-sm"
                style={[styles.fontMedium, { color: isActive ? '#fff' : '#444' }]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  )
}

export default function FilterOverlay({ visible, onClose, filters, onApply }) {
  const [priceMin, setPriceMin] = useState(filters?.priceMin ?? 0)
  const [priceMax, setPriceMax] = useState(filters?.priceMax ?? 500)
  const [selectedBrands, setSelectedBrands] = useState(filters?.brands ?? [])
  const [availability, setAvailability] = useState(filters?.availability ?? null)
  const [prescriptionType, setPrescriptionType] = useState(filters?.prescriptionType ?? null)

  useEffect(() => {
    if (visible) {
      setPriceMin(filters?.priceMin ?? 0)
      setPriceMax(filters?.priceMax ?? 500)
      setSelectedBrands(filters?.brands ?? [])
      setAvailability(filters?.availability ?? null)
      setPrescriptionType(filters?.prescriptionType ?? null)
    }
  }, [visible])

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    )
  }

  const handleReset = () => {
    setPriceMin(0)
    setPriceMax(500)
    setSelectedBrands([])
    setAvailability(null)
    setPrescriptionType(null)
  }

  const handleApply = () => {
    onApply({ priceMin, priceMax, brands: selectedBrands, availability, prescriptionType })
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-6 w-full max-h-[85%]" onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-lg mb-4" style={styles.titleBold}>Filter by:</Text>

            <PriceRangeSection
              priceMin={priceMin}
              priceMax={priceMax}
              setPriceMin={setPriceMin}
              setPriceMax={setPriceMax}
              onReset={handleReset}
            />
            <BrandSection selectedBrands={selectedBrands} toggleBrand={toggleBrand} />
            <ChipGroup title="Availability" options={availabilityOptions} selected={availability} onSelect={setAvailability} />
            <ChipGroup title="Prescription Type" options={prescriptionOptions} selected={prescriptionType} onSelect={setPrescriptionType} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  titleBold: {
    fontFamily: 'Poppins-Bold',
    color: '#444',
  },
  resetText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#48AAD9',
  },
  textMedium: {
    fontFamily: 'Poppins-Medium',
    color: '#444',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
})
