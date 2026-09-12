import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@shared/theme/colorPalette';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const getCustomerNote = (note) => {
  if (!note || typeof note !== 'string') return null;
  const parts = note.split('|').map((p) => p.trim());
  const customerParts = parts.filter(
    (p) => !p.match(/^(payment receipt rejected|customer acknowledged payment issue|pos walk-in sale)/i)
  );
  const clean = customerParts.join(' | ').trim();
  return clean || null;
};

export default function OrderCard({ order, statusBadge, children }) {
  const customerNote = getCustomerNote(order?.note);

  return (
    <View className="bg-white rounded-2xl mx-4 mt-4 shadow-md elevation-2 overflow-hidden">
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-base" style={styles.orderNumber}>
              Order #{order.orderNumber}
            </Text>
          </View>
          <View style={{ marginTop: -2 }}>
            {statusBadge}
          </View>
        </View>

        <View className="flex-row items-center mt-3">
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

        {Boolean(customerNote) && (
          <View
            className="mt-2.5 p-2.5 rounded-xl border flex-row items-start"
            style={styles.customerNoteContainer}
          >
            <MaterialCommunityIcons
              name="note-text-outline"
              size={15}
              color="#0284C7"
              style={{ marginTop: 1, marginRight: 6 }}
            />
            <View className="flex-1">
              <Text className="text-[11px]" style={styles.customerNoteTitle}>
                Customer Note:
              </Text>
              <Text className="text-xs mt-0.5 leading-4" style={styles.customerNoteText}>
                {customerNote}
              </Text>
            </View>
          </View>
        )}
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
  customerNoteContainer: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  customerNoteTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#0369A1',
    includeFontPadding: false,
  },
  customerNoteText: {
    fontFamily: 'Poppins-Regular',
    color: '#334155',
    includeFontPadding: false,
  },
});
