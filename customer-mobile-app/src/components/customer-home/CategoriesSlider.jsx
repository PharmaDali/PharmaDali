import { ScrollView, TouchableOpacity, View, Text } from 'react-native'
import React from 'react'
import { CATEGORY_ICONS } from '@src/utils/categoryUtils';

function CategoryCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity className="items-center mr-2 w-20" onPress={onPress}>
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

const CategoriesSlider = ({ categories = [], onCategoryPress }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-2">
      {categories.map((item) => {
        const rawLabel = item?.category_name || 'Category';
        const label = rawLabel.trim();
        const IconComponent = CATEGORY_ICONS[label];

        return (
          <CategoryCard
            key={item?.id || label}
            icon={IconComponent ? <IconComponent width={24} height={24} /> : <Text className="text-2xl">🛍️</Text>}
            label={label}
            onPress={() => onCategoryPress?.(item, label)}
          />
        );
      })}
    </ScrollView>
  )
}

export default CategoriesSlider