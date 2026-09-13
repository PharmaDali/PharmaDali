import { ScrollView, TouchableOpacity, View, Text } from 'react-native'
import React from 'react'
import { CATEGORY_ICONS } from '@src/utils/categoryUtils';

function CategoryCard({ icon, label, onPress, isLast }) {
  return (
    <TouchableOpacity className={`items-center w-20 ${isLast ? '' : 'mr-2'}`} onPress={onPress}>
      <View className="w-16 h-16 rounded-lg bg-[#F7F9FF] border border-[#C1BCBC] items-center justify-center">
        {icon}
      </View>
      <Text
        className="text-xs mt-1 text-gray-600 text-center"
        numberOfLines={2}
        style={{ fontFamily: 'Poppins-Medium', lineHeight: 14 }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

const CategoriesSlider = ({ categories = [], limit = 8, onCategoryPress }) => {
  const visibleCategories = limit ? categories.slice(0, limit) : categories;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-2"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {visibleCategories.map((item, idx) => {
        const rawLabel = item?.category_name || 'Category';
        const label = toTitleCase(rawLabel.trim());
        const IconComponent = CATEGORY_ICONS[label];

        return (
          <CategoryCard
            key={item?.id || label}
            icon={IconComponent ? <IconComponent width={24} height={24} /> : <Text className="text-2xl">🛍️</Text>}
            label={label}
            isLast={idx === visibleCategories.length - 1}
            onPress={() => onCategoryPress?.(item, label)}
          />
        );
      })}
    </ScrollView>
  )
}

export default CategoriesSlider