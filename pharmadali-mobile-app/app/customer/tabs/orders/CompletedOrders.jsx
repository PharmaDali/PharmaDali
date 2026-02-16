import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '@shared/colorPallete';
import { StatusBadge, ProductRow } from './OrderComponents';
import BetadineImg from '@assets/images/betadine_img.png';

const completedOrders = [
  {
    orderNumber: '05',
    date: 'January 20, 2026, 10:00am',
    status: 'Completed',
    products: [
      { img: BetadineImg, description: 'Tolak Angin Care Essential Oil Roll On 10ml', price: '₱50.00', quantity: 1, size: '10ml' },
    ],
    orderSummary: '₱339.00',
  },
  {
    orderNumber: '04',
    date: 'January 10, 2026, 10:00am',
    status: 'Rejected',
    products: [
      { img: BetadineImg, description: 'Acnetrex Isotretinoin 20mg 20 Softgel Capsule', price: '₱1,530.00', quantity: 1, size: '20mg', prescriptionRequired: true },
    ],
    orderSummary: '₱1,530.00',
  },
];

function CompletedOrderCard({ order }) {
  return (
    <View className="border border-gray-200 bg-white rounded-2xl py-4 px-4 mt-4 mx-4 shadow-md elevation-2">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-sm font-bold" style={styles.textColor}>Order #{order.orderNumber}</Text>
          <Text className="text-xs text-gray-500 mt-1">{order.date}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View className="border-b border-gray-200 my-3" />

      {order.products.map((product, idx) => (
        <ProductRow key={idx} product={product} />
      ))}

      <View className="border-b border-gray-200 my-3" />

      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-bold" style={styles.textColor}>Order Summary</Text>
        <Text className="text-sm font-bold" style={styles.primaryLabel}>{order.orderSummary}</Text>
      </View>

      <View className="items-center mt-4 mb-1">
        <TouchableOpacity className="flex-row items-center rounded-xl px-6 py-2" style={styles.viewDetailsButton}>
          <Text className="text-sm font-semibold text-white mr-1">View Details</Text>

          {/* //TODO: Add right arrow icon here */}
          <Text className="text-sm font-semibold text-white"></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CompletedOrders() {
  return (
    <View className="mt-4 mb-4">
      {completedOrders.map((order, index) => (
        <CompletedOrderCard key={index} order={order} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  primaryLabel: {
    color: colors.buttonColor,
  },
  textColor: {
    color: colors.textColor,
  },
  viewDetailsButton: {
    backgroundColor: colors.buttonColor,
    borderRadius: 12,
  },
});
