import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import RxIcon from '@assets/icons/rx_icon.svg';

const statusColors = {
  pending: { bg: '#E9E9E9', border: '#888888', text: '#333333' },
  reviewing: { bg: '#F3E8FF', border: '#C084FC', text: '#6B21A8' },
  preparing: { bg: '#D1ECF1', border: '#48AAD9', text: '#0C5460' },
  approved: { bg: '#D4EDDA', border: '#60B17E', text: '#60B17E' },
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
    <View className="px-3 py-1 overflow-hidden" style={{ borderRadius: 8, backgroundColor: color.bg, borderWidth: 1, borderColor: color.border }}>
      <Text className="text-xs" style={{ color: color.text, fontFamily: 'Poppins-SemiBold' }}>{status || 'Pending'}</Text>
    </View>
  );
}

export function ProductRow({ product }) {
  return (
    <View className="flex-row mt-3">
      <Image source={product.img} className="w-16 h-16 rounded-lg" resizeMode="contain" />
      <View className="flex-1 ml-3">
        <Text className="text-sm" style={{ fontFamily: 'Poppins-SemiBold' }} numberOfLines={2}>{product.description}</Text>
        {product.prescriptionRequired && (
          <View className="flex-row items-center mt-1">
            <RxIcon width={12} height={12} />
            <Text className="text-xs ml-1" style={{ color: '#DC3545', fontFamily: 'Poppins-Medium' }}>Prescription Required</Text>
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
