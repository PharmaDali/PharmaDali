import { ScrollView, TouchableOpacity, View, Text } from 'react-native'
import React from 'react'

function CategoryCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity className="items-center mr-4" onPress={onPress}>
      <View className="w-16 h-16 rounded-full bg-blue-200 items-center justify-center">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <Text className="text-xs mt-1 text-gray-600" style={{ fontFamily: 'Poppins-Medium' }}>{label}</Text>
    </TouchableOpacity>
  );
}

const CategoriesSlider = ({ categories = [], onCategoryPress }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mt-2">
      {categories.map((item) => {
        const label = item?.category_name || 'Category';

        return (
          <CategoryCard
            key={item?.id || label}
            icon="🛍️"
            label={label}
            onPress={() => onCategoryPress?.(item, label)}
          />
        );
      })}
    </ScrollView>
  )
}

export default CategoriesSlider