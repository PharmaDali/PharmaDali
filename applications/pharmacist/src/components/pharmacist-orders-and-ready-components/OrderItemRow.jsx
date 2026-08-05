import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import { StatusBadge } from '@shared/components/OrderComponents';
import ProductImage from '@shared/components/ProductImage';

export default function OrderItemRow({ item }) {
  return (
    <View className="flex-row py-3">
      <ProductImage
        source={item.img}
        product={item.product}
        categoryName={item.categoryName}
        quantity={item.quantity}
        isPrescribed={item.prescriptionRequired}
        width={64}
        height={64}
        containerStyle={{ borderRadius: 8, backgroundColor: '#F3F4F6' }}
      />
      <View className="flex-1 ml-3 justify-center">
        <View className="flex-row justify-between items-start">
          <Text className="text-xs flex-1 mr-2" style={{ fontFamily: 'Poppins-SemiBold', color: colors.textColor }} numberOfLines={2}>
            {item.description}
          </Text>
          <Text className="text-xs text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
            {item.quantity}x
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm" style={styles.price}>
            PHP {item.price}
          </Text>
          <Text className="text-xs text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
            {item.sizeLabel || 'Size'}: {item.size}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  price: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
});
