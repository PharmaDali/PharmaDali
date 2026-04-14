import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@shared/theme/colorPalette';
import AddToCartIcon from '@assets/icons/add_to_cart_icon.svg';
import RxIcon from '@assets/icons/rx_icon.svg';

export default function ProductCard({
  img,
  description,
  category,
  price,
  style,
  productId,
  branchProductId,
  branchId,
  onAddToCart,
  isPrescribed = false,
}) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/customer/tabs/shop/ProductView',
      params: {
        productId: productId || '1',
        branchProductId: branchProductId ? String(branchProductId) : '',
        branchId: branchId ? String(branchId) : '',
      },
    });
  };

  const handleAddToCartPress = (event) => {
    event?.stopPropagation?.();

    if (typeof onAddToCart === 'function') {
      onAddToCart({
        productId,
        branchProductId,
        branchId,
      });
      return;
    }
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
        <Text
          className="text-xs text-gray-600 mt-2"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ fontFamily: 'Poppins-Medium' }}
        >
          {category}
        </Text>
        {isPrescribed && (
          <View className="flex-row items-center mt-1">
            <RxIcon width={12} height={12} />
            <Text className="text-[10px] ml-1" style={styles.rxText}>Prescription Required</Text>
          </View>
        )}
        <Text className="text-sm mt-2" style={{ fontFamily: 'Poppins-Medium' }} numberOfLines={2}>{description}</Text>
        
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-md" style={styles.priceBold}>{price}</Text>
            <TouchableOpacity onPress={handleAddToCartPress} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <AddToCartIcon width={28} height={28} />
            </TouchableOpacity>
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
  rxText: {
    fontFamily: 'Poppins-Medium',
    color: '#DC3545',
  },
});
