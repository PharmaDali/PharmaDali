import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { colors } from '@shared/colorPallete';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import OrderCard from './OrderCard';
import OrderItemRow from './OrderItemRow';

export default function IssueOrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  const issueItems = order.items.filter((item) => item.status === 'Rejected' || item.status === 'Pending');
  const rejectedItems = order.items.filter((item) => item.status === 'Rejected');
  const pendingItems = order.items.filter((item) => item.status === 'Pending');
  
  const issueCount = issueItems.length;

  let issueSummary = '';
  if (issueCount === 1) {
    const item = issueItems[0];
    issueSummary = `1 item ${item.status.toLowerCase()}: ${item.rejectionReason || 'Requires attention'}`;
  } else {
    issueSummary = `${issueCount} items have issues`;
  }

  const statusBadge = (
    <View className="px-3 py-1 rounded-lg border" style={styles.awaitingBadge}>
      <Text className="text-xs" style={styles.awaitingText}>Awaiting Customer Action</Text>
    </View>
  );

  return (
    <OrderCard order={order} statusBadge={statusBadge}>
      <View className="px-4 pb-2">
        <Text className="text-xs" style={{ fontFamily: 'Poppins-Medium', color: colors.textColor }}>
          {issueSummary}
        </Text>
      </View>

      {!expanded ? (
        <View className="items-end px-4 pb-4">
          <TouchableOpacity
            className="flex-row items-center rounded-xl px-5 py-2"
            style={{ backgroundColor: colors.buttonColor }}
            onPress={() => setExpanded(true)}
          >
            <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
              View details
            </Text>
            <View className="ml-2">
              <ArrowDownIcon width={12} height={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        
        <View>
          {rejectedItems.length > 0 && (
            <View className="px-4 border-t border-gray-100">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>Rejected Items</Text>
              {rejectedItems.map((item, idx) => (
                <View key={idx}>
                  <OrderItemRow item={item} />
                  {item.rejectionReason && (
                    <Text className="text-xs mb-2" style={{ fontFamily: 'Poppins-Medium', color: colors.accent }}>
                      Reason: {item.rejectionReason}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {pendingItems.length > 0 && (
            <View className="px-4 border-t border-gray-100">
              <Text className="text-sm mt-3" style={styles.sectionTitle}>Pending Items</Text>
              {pendingItems.map((item, idx) => (
                <View key={idx}>
                  <OrderItemRow item={item} />
                  {item.rejectionReason && (
                    <Text className="text-xs mb-2" style={{ fontFamily: 'Poppins-Medium', color: '#FFC107' }}>
                      Reason: {item.rejectionReason}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View className="flex-row justify-between items-center px-4 py-3 border-t border-gray-100">
            <Text className="text-sm" style={styles.sectionTitle}>Order Summary</Text>
            <Text className="text-base" style={styles.totalPrice}>₱ {order.orderTotal}</Text>
          </View>

          <View className="items-center pb-3">
            <TouchableOpacity
              className="flex-row items-center rounded-xl px-5 py-2"
              style={{ backgroundColor: colors.buttonColor }}
              onPress={() => setExpanded(false)}
            >
              <Text className="text-sm text-white" style={{ fontFamily: 'Poppins-SemiBold' }}>
                Collapse
              </Text>
              <View className="ml-2">
                <ArrowUpIcon width={12} height={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </OrderCard>
  );
}

const styles = StyleSheet.create({
  awaitingBadge: {
    borderColor: '#48AAD9',
    backgroundColor: '#EAF6FC',
  },
  awaitingText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#0C5460',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
});
