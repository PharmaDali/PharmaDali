import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@shared/colorPallete';
import { StatusBadge } from '@shared/components/OrderComponents';

export default function OrderItemRow({ item }) {
  return (
    <View className="flex-row py-3">
      <Image
        source={item.img}
        className="w-16 h-16 rounded-lg bg-gray-100"
        resizeMode="contain"
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

        {item.status && (
          <View className="self-start mt-1">
            <StatusBadge status={item.status} />
          </View>
        )}

        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-sm" style={styles.price}>
            ₱{item.price}
          </Text>
          <Text className="text-xs text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
            Size: {item.size}
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
