import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@shared/colorPallete';
import AddToCartIcon from '@assets/icons/add_to_cart_icon.svg';

export default function ProductCard({ img, description, category, price, style, productId }) {
  const router = useRouter();

  const handlePress = () => {
    router.push({ pathname: '/customer/tabs/shop/ProductView', params: { productId: productId || '1' } });
  };

  return (
    <TouchableOpacity style={[{ width: 150 }, style]} onPress={handlePress}>
      <View className="rounded-xl bg-gray-50 p-3 border border-gray-200">
        <Image
          source={img}
          className="w-full rounded-lg"
          style={{ height: 120 }}
          resizeMode="contain"
        />
        <Text className="text-xs text-gray-600 mt-2" style={{ fontFamily: 'Poppins-Medium' }}>{category}</Text>
        <Text className="text-sm mt-2" style={{ fontFamily: 'Poppins-Medium' }} numberOfLines={2}>{description}</Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-md" style={styles.priceBold}>{price}</Text>
          <AddToCartIcon width={28} height={28} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  priceBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
});
