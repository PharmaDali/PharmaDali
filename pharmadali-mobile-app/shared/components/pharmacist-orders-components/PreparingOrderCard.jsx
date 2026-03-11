import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@shared/colorPallete';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

export default function PreparingOrderCard({ order, onMarkAsReady }) {
  return (
    <OrderCard order={order}>
      <View className="px-4 border-t border-gray-100">
        <Text className="text-sm mt-3" style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, idx) => (
          <OrderItemRow key={idx} item={item} />
        ))}
      </View>

      <View className="flex-row justify-between items-center px-4 py-3 border-t border-gray-100">
        <Text className="text-sm" style={styles.sectionTitle}>Order Summary</Text>
        <Text className="text-base" style={styles.totalPrice}>₱{order.orderTotal}</Text>
      </View>

      <View className="items-end px-4 pb-4">
        <TouchableOpacity
          className="rounded-xl px-6 py-2"
          style={{ backgroundColor: colors.buttonColor }}
          onPress={() => onMarkAsReady?.(order)}
        >
          <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
            Mark as ready
          </Text>
        </TouchableOpacity>
      </View>
    </OrderCard>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
});
