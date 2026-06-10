import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import RxIcon from '@assets/icons/rx_icon.svg';
import ProductImage from '@shared/components/ProductImage';

const statusColors = {
  pending: { bg: '#E9E9E9', border: '#888888', text: '#333333' },
  reviewing: { bg: '#F3E8FF', border: '#C084FC', text: '#6B21A8' },
  preparing: { bg: '#D1ECF1', border: '#48AAD9', text: '#0C5460' },
  approved: { bg: '#D4EDDA', border: '#60B17E', text: '#60B17E' },
  stand_by: { bg: '#FFF9C4', border: '#F59E0B', text: '#92400E' },
  ready_for_pickup: { bg: '#D4EDDA', border: '#60B17E', text: '#14532D' },
  rejected: { bg: '#333333', border: '#444444', text: '#FFFFFF' },
  cancelled: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  completed: { bg: '#48AAD9', border: '#96D2EE', text: '#FFFFFF' },
  overdue: { bg: '#FFF7ED', border: '#FB923C', text: '#9A3412' },
};

export function StatusBadge({ status }) {
  const normalizedStatus = String(status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const color = statusColors[normalizedStatus] || statusColors.pending;

  return (
    <View className="px-2 py-0.5 overflow-hidden" style={{ borderRadius: 6, backgroundColor: color.bg, borderWidth: 1, borderColor: color.border }}>
      <Text className="text-[10px]" style={{ color: color.text, fontFamily: 'Poppins-SemiBold' }}>{status || 'Pending'}</Text>
    </View>
  );
}

export function ProductRow({ product }) {
  return (
    <View className="flex-row mt-3">
      <ProductImage
        source={product.img}
        product={product.product}
        categoryName={product.categoryName}
        quantity={product.quantity}
        isPrescribed={product.prescriptionRequired}
        width={64}
        height={64}
        containerStyle={{ borderRadius: 8 }}
      />
      <View className="flex-1 ml-3">
        <Text className="text-sm" style={{ fontFamily: 'Poppins-SemiBold' }} numberOfLines={2}>{product.description}</Text>
        {product.prescriptionRequired && (
          <View className="mt-1">
            <View className="flex-row items-center">
              <RxIcon width={12} height={12} />
              <Text className="text-xs ml-1" style={{ color: '#DC3545', fontFamily: 'Poppins-Medium' }}>Prescription Required</Text>
            </View>
            {!!product.rxDescription && (
              <Text className="text-[11px] ml-4 mt-0.5" numberOfLines={2} style={{ color: '#7A7A7A', fontFamily: 'Poppins-Medium' }}>
                {product.rxDescription}
              </Text>
            )}
          </View>
        )}
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm" style={styles.priceBold}>{product.price}</Text>
          <View className="items-end">
            {product.quantity > 0 && <Text className="text-xs text-gray-500" style={{ fontFamily: 'Poppins-Medium' }}>{product.quantity}x</Text>}
            <Text className="text-xs text-gray-500" style={{ fontFamily: 'Poppins-Medium' }}>Size: {product.size}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  priceBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
});
