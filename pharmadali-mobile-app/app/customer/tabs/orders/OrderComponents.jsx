import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '@shared/colorPallete';

const statusColors = {
  Pending:    { bg: '#E9E9E9', border: '#888888', text: '#333333' },
  Preparing:  { bg: '#D1ECF1', border: '#48AAD9', text: '#0C5460' },
  Approved:   { bg: '#D4EDDA', border: '#60B17E', text: '#60B17E' },
  Rejected:   { bg: '#333333', border: '#444444', text: '#FFFFFF' },
  Completed:  { bg: '#48AAD9', border: '#96D2EE', text: '#FFFFFF' },
};

export function StatusBadge({ status }) {
  const color = statusColors[status] || statusColors.Pending;
  return (
    <View className="px-3 py-1 overflow-hidden" style={{ borderRadius: 8, backgroundColor: color.bg, borderWidth: 1, borderColor: color.border }}>
      <Text className="text-xs font-semibold" style={{ color: color.text }}>{status}</Text>
    </View>
  );
}

export function ProductRow({ product }) {
  return (
    <View className="flex-row mt-3">
      <Image source={product.img} className="w-16 h-16 rounded-lg" resizeMode="contain" />
      <View className="flex-1 ml-3">
        <Text className="text-sm font-semibold" numberOfLines={2}>{product.description}</Text>
        {/* //TODO: Add prescription icon here */}
        {product.prescriptionRequired && (
          <Text className="text-xs mt-1" style={{ color: '#DC3545' }}>℞ Prescription Required</Text>
        )}
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm font-bold" style={styles.price}>{product.price}</Text>
          <View className="items-end">
            {product.quantity > 0 && <Text className="text-xs text-gray-500">{product.quantity}x</Text>}
            <Text className="text-xs text-gray-500">Size: {product.size}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  price: {
    color: colors.buttonColor,
  },
});
