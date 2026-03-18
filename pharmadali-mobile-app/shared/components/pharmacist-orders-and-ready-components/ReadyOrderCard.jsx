import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { colors } from '@shared/colorPallete';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

const statusConfig = {
  'For Pickup': {
    label: 'Ready',
    borderColor: '#72C1E6',
    backgroundColor: '#E7F5FC',
    textColor: '#3D9BC7',
  },
  Completed: {
    label: 'Completed',
    borderColor: '#93D3A2',
    backgroundColor: '#ECF9F0',
    textColor: '#3F8A56',
  },
  Expired: {
    label: 'Expired',
    borderColor: '#D9A1A1',
    backgroundColor: '#FAEEEE',
    textColor: '#B15A5A',
  },
};

export default function ReadyOrderCard({ order, onMarkAsCompleted }) {
  const [expanded, setExpanded] = useState(false);
  const isForPickup = order.status === 'For Pickup';
  const status = statusConfig[order.status] ?? statusConfig['For Pickup'];

  const statusBadge = (
    <View
      className="px-3 py-1 rounded-lg border"
      style={{ borderColor: status.borderColor, backgroundColor: status.backgroundColor }}
    >
      <Text className="text-xs" style={{ fontFamily: 'Poppins-SemiBold', color: status.textColor }}>
        {status.label}
      </Text>
    </View>
  );

  return (
    <OrderCard order={order} statusBadge={statusBadge}>
      {!expanded ? (
        <View>
          <View className="items-center pb-4 pt-1">
            <TouchableOpacity
              className="flex-row items-center rounded-xl px-5 py-2 border"
              style={styles.viewMoreButton}
              onPress={() => setExpanded(true)}
            >
              <Text className="text-sm" style={styles.viewMoreText}>View More</Text>
              <View className="ml-2">
                <ArrowDownIcon width={12} height={12} color={colors.buttonColor} />
              </View>
            </TouchableOpacity>
          </View>

          {isForPickup && (
            <View className="border-t border-gray-100 pb-4 pt-3 items-center">
              <TouchableOpacity
                className="rounded-xl px-6 py-2"
                style={styles.markCompletedButton}
                onPress={() => onMarkAsCompleted?.(order)}
              >
                <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Mark as Completed
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View>
          <View className="px-4 border-t border-gray-100">
            <Text className="text-sm mt-3" style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item, idx) => (
              <OrderItemRow key={idx} item={item} />
            ))}
          </View>

          <View className="flex-row justify-between items-center px-4 py-3 border-t border-gray-100">
            <Text className="text-sm" style={styles.sectionTitle}>Order Summary</Text>
            <Text className="text-base" style={styles.totalPrice}>₱ {order.orderTotal}</Text>
          </View>

          <View className="items-center pb-3">
            <TouchableOpacity
              className="flex-row items-center rounded-xl px-5 py-2 border"
              style={styles.viewMoreButton}
              onPress={() => setExpanded(false)}
            >
              <Text className="text-sm" style={styles.viewMoreText}>Collapse</Text>
              <View className="ml-2">
                <ArrowUpIcon width={12} height={12} color={colors.buttonColor} />
              </View>
            </TouchableOpacity>
          </View>

          {isForPickup && (
            <View className="border-t border-gray-100 pb-4 pt-3 items-center">
              <TouchableOpacity
                className="rounded-xl px-6 py-2"
                style={styles.markCompletedButton}
                onPress={() => onMarkAsCompleted?.(order)}
              >
                <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                  Mark as Completed
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  markCompletedButton: {
    backgroundColor: colors.buttonColor,
  },
  viewMoreButton: {
    borderColor: '#89C5E5',
    backgroundColor: '#EEF8FD',
  },
  viewMoreText: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.buttonColor,
  },
});