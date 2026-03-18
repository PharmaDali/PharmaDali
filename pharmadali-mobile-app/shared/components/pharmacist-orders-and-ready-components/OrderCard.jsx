import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@shared/colorPallete';

export default function OrderCard({ order, statusBadge, children }) {
  return (
    <View className="bg-white rounded-2xl mx-4 mt-4 shadow-md elevation-2 overflow-hidden">
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base" style={styles.orderNumber}>
            Order #{order.orderNumber}
          </Text>
          {statusBadge}
        </View>

        <View className="flex-row items-center mt-2">
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
            {order.customerAvatar && <order.customerAvatar width={40} height={40} />}
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm" style={{ fontFamily: 'Poppins-SemiBold', color: colors.textColor }}>
              {order.customerName}
            </Text>
          </View>
          <Text className="text-xs text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
            Items: {order.items.length}
          </Text>
        </View>

        <Text className="text-xs mt-2" style={{ fontFamily: 'Poppins-Medium', color: colors.textColor }}>
          Pickup: {order.pickupTime}
        </Text>
        <Text className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Poppins-Medium' }}>
          Submitted {order.submittedAgo}
        </Text>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  orderNumber: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
});
