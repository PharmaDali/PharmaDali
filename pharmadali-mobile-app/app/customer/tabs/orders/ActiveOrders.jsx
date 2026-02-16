import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '@shared/colorPallete';
import { StatusBadge, ProductRow } from './OrderComponents';
import BetadineImg from '@assets/images/betadine_img.png';

const activeOrders = [
  {
    orderNumber: '06',
    date: 'January 25, 2026, 10:00am',
    status: 'Pending',
    products: [
      { img: BetadineImg, description: 'Berocca Effervescent Tablet Orange Flavor 15s', price: '₱339.00', quantity: 1, size: '15s' },
    ],
    orderSummary: '₱339.00',
  },
  {
    orderNumber: '06',
    date: 'January 25, 2026, 10:00am',
    status: 'Preparing',
    products: [
      { img: BetadineImg, description: 'Berocca Effervescent Tablet Orange Flavor 15s', price: '₱339.00', quantity: 1, size: '15s' },
    ],
    orderSummary: '₱339.00',
  },
  {
    orderNumber: '1028',
    date: 'January 07, 2026, 10:00am',
    status: 'Approved',
    products: [
      { img: BetadineImg, description: 'Imodium 2mg 4s - Diarrhea Medicine, Loperamide', price: '₱80.25', quantity: 1, size: '2mg' },
      { img: BetadineImg, description: 'LACRYVISC Carbomer 10g', price: '₱437.75', quantity: 0, size: '10g', prescriptionRequired: true },
      { img: BetadineImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', price: '₱9.50', quantity: 1, size: '4x4' },
    ],
    orderSummary: '₱527.50',
  },
];

function ActiveOrderCard({ order }) {
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
        <TouchableOpacity className="rounded-xl border px-6 py-2" style={styles.cancelButton}>
          <Text className="text-sm font-semibold" style={styles.primaryLabel}>Cancel Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ActiveOrders() {
  return (
    <View className="mt-4 mb-4">
      {activeOrders.map((order, index) => (
        <ActiveOrderCard key={index} order={order} />
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
  cancelButton: {
    borderColor: colors.buttonColor,
  },
});
