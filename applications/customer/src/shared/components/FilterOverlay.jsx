import { Text, View, Modal, TouchableOpacity, Pressable, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import Slider from '@react-native-community/slider'

const availabilityOptions = ['In Stock Only', 'Out of Stock', 'Low Stock']

const prescriptionOptions = ['Prescription Required', 'Over-the-Counter']

const MAX_PRICE = 5000

function PriceRangeSection({ priceMin, priceMax, setPriceMin, setPriceMax, onReset }) {
  const [minText, setMinText] = useState(String(Math.round(priceMin)))
  const [maxText, setMaxText] = useState(String(Math.round(priceMax)))

  useEffect(() => {
    setMinText(String(Math.round(priceMin)))
  }, [priceMin])

  useEffect(() => {
    setMaxText(String(Math.round(priceMax)))
  }, [priceMax])

  const handleMinChange = (text) => {
    const digitsOnly = text.replace(/[^0-9]/g, '')
    setMinText(digitsOnly)
    if (digitsOnly !== '') {
      const val = Number(digitsOnly)
      setPriceMin(val)
      if (val > priceMax) {
        setPriceMax(val)
      }
    }
  }

  const handleMinBlur = () => {
    if (minText === '') {
      setMinText('0')
      setPriceMin(0)
    } else {
      const val = Number(minText)
      setMinText(String(val))
      setPriceMin(val)
    }
  }

  const handleMaxChange = (text) => {
    const digitsOnly = text.replace(/[^0-9]/g, '')
    setMaxText(digitsOnly)
    if (digitsOnly !== '') {
      const val = Number(digitsOnly)
      setPriceMax(val)
      if (val < priceMin) {
        setPriceMin(val)
      }
    }
  }

  const handleMaxBlur = () => {
    if (maxText === '') {
      setMaxText(String(MAX_PRICE))
      setPriceMax(MAX_PRICE)
    } else {
      const val = Number(maxText)
      setMaxText(String(val))
      setPriceMax(val)
    }
  }

  return (
    <>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base" style={styles.titleBold}>Price Range</Text>
        <TouchableOpacity onPress={onReset}>
          <Text className="text-sm" style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-2">
        <Slider
          minimumValue={0}
          maximumValue={MAX_PRICE}
          step={50}
          value={Math.min(priceMin, MAX_PRICE)}
          onValueChange={(val) => {
            const rounded = Math.round(val)
            setPriceMin(Math.min(rounded, priceMax))
          }}
          minimumTrackTintColor="#48AAD9"
          maximumTrackTintColor="#48AAD9"
          thumbTintColor="#48AAD9"
        />
        <Slider
          minimumValue={0}
          maximumValue={MAX_PRICE}
          step={50}
          value={Math.min(priceMax, MAX_PRICE)}
          onValueChange={(val) => {
            const rounded = Math.round(val)
            setPriceMax(Math.max(rounded, priceMin))
          }}
          minimumTrackTintColor="#48AAD9"
          maximumTrackTintColor="#D1D5DB"
          thumbTintColor="#48AAD9"
        />
      </View>

      <View className="flex-row items-center justify-center gap-3 mb-6">
        <View className="flex-1 flex-row items-center rounded-full border border-gray-300 px-3.5 py-1.5 bg-gray-50">
          <Text className="text-xs text-gray-500 mr-1.5" style={styles.fontMedium}>PHP</Text>
          <TextInput
            className="flex-1 text-sm text-[#444] p-0"
            style={styles.inputStyle}
            keyboardType="numeric"
            value={minText}
            onChangeText={handleMinChange}
            onBlur={handleMinBlur}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>

        <Text className="text-gray-400" style={styles.fontMedium}>–</Text>

        <View className="flex-1 flex-row items-center rounded-full border border-gray-300 px-3.5 py-1.5 bg-gray-50">
          <Text className="text-xs text-gray-500 mr-1.5" style={styles.fontMedium}>PHP</Text>
          <TextInput
            className="flex-1 text-sm text-[#444] p-0"
            style={styles.inputStyle}
            keyboardType="numeric"
            value={maxText}
            onChangeText={handleMaxChange}
            onBlur={handleMaxBlur}
            placeholder="5000"
            placeholderTextColor="#9CA3AF"
            selectTextOnFocus
            returnKeyType="done"
          />
        </View>
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
  const [priceMax, setPriceMax] = useState(filters?.priceMax ?? MAX_PRICE)
  const [availability, setAvailability] = useState(filters?.availability ?? null)
  const [prescriptionType, setPrescriptionType] = useState(filters?.prescriptionType ?? null)

  useEffect(() => {
    if (visible) {
      setPriceMin(filters?.priceMin ?? 0)
      setPriceMax(filters?.priceMax ?? MAX_PRICE)
      setAvailability(filters?.availability ?? null)
      setPrescriptionType(filters?.prescriptionType ?? null)
    }
  }, [visible, filters])

  const handleReset = () => {
    setPriceMin(0)
    setPriceMax(MAX_PRICE)
    setAvailability(null)
    setPrescriptionType(null)
  }

  const handleApply = () => {
    const nextFilters = {}
    const parsedMin = Math.round(Number(priceMin) || 0)
    const parsedMax = Math.round(Number(priceMax) || MAX_PRICE)

    if (parsedMin > 0) {
      nextFilters.priceMin = parsedMin
    }
    if (parsedMax < MAX_PRICE) {
      nextFilters.priceMax = parsedMax
    }
    if (availability) {
      nextFilters.availability = availability
    }
    if (prescriptionType) {
      nextFilters.prescriptionType = prescriptionType
    }

    onApply(nextFilters)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
          <Pressable className="bg-white rounded-2xl p-6 w-full max-h-[85%]" onPress={(e) => e.stopPropagation()}>
            {/* Header with Title and Close Button */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg" style={styles.titleBold}>Filter by:</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-base text-gray-500 font-bold leading-none">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <PriceRangeSection
                priceMin={priceMin}
                priceMax={priceMax}
                setPriceMin={setPriceMin}
                setPriceMax={setPriceMax}
                onReset={handleReset}
              />

              <ChipGroup
                title="Availability"
                options={availabilityOptions}
                selected={availability}
                onSelect={setAvailability}
              />

              <ChipGroup
                title="Prescription Type"
                options={prescriptionOptions}
                selected={prescriptionType}
                onSelect={setPrescriptionType}
              />
            </ScrollView>

            {/* Action Button */}
            <View className="pt-2.5 border-t border-gray-100 mt-1">
              <TouchableOpacity
                onPress={handleApply}
                className="w-full h-[42px] rounded-xl bg-[#48AAD9] items-center justify-center shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="text-sm text-white" style={styles.buttonText}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
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
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
  },
  inputStyle: {
    fontFamily: 'Poppins-Medium',
    color: '#444',
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
    fontSize: 14,
  },
})
