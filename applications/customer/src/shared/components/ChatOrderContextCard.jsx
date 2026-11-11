import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@src/shared/theme/colorPalette';
import ProductImage from '@shared/components/ProductImage';
import { StatusBadge } from '@shared/components/OrderComponents';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ChatOrderContextCard({ order, onPressDetails }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const chevronAnim = useRef(new Animated.Value(0)).current;

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const totalAmount = Number(order.total_amount ?? 0).toFixed(2);
  const orderNumberShort = order.order_number
    ? order.order_number.includes('-')
      ? order.order_number.split('-').pop()
      : order.order_number
    : String(order.id);

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        260,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
    setIsCollapsed((prev) => {
      const next = !prev;
      Animated.timing(chevronAnim, {
        toValue: next ? 0 : 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      return next;
    });
  };

  const chevronRotation = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View className="px-3 pt-1.5 pb-1 bg-slate-50 z-10">
      <View
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
        style={isCollapsed ? ss.collapsedShadow : ss.cardShadow}
      >
        {/* Toggle Bar / Header */}
        <Pressable
          className="flex-row items-center justify-between px-3.5 py-2.5"
          onPress={toggleCollapse}
          android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
        >
          <View className="flex-row items-center flex-1 gap-x-2 flex-wrap">
            <Text className="text-[12px] text-slate-800" style={ss.semibold}>
              #{isCollapsed ? orderNumberShort : (order.order_number || orderNumberShort)}
            </Text>
            {isCollapsed && (
              <>
                <Text className="text-[12px] text-slate-400">•</Text>
                <Text className="text-[12px]" style={[ss.bold, { color: colors.buttonColor }]}>
                  PHP {totalAmount}
                </Text>
              </>
            )}
            <View style={isCollapsed ? ss.scaleBadge : undefined}>
              <StatusBadge status={order.status} />
            </View>
          </View>

          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#64748B" />
          </Animated.View>
        </Pressable>

        {/* Expanded Content */}
        {!isCollapsed && (
          <View style={ss.expandedContainer}>
            {/* Items list */}
            <ScrollView
              style={ss.itemsScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {items.length === 0 ? (
                <View className="flex-row items-center py-3 gap-x-2">
                  <MaterialCommunityIcons name="pill" size={18} color="#94A3B8" />
                  <Text className="text-[12px] text-slate-400" style={ss.medium}>
                    No item details available
                  </Text>
                </View>
              ) : (
                items.map((item, index) => {
                  const pharmacyProduct = item.pharmacy_product || item.pharmacyProduct || null;
                  const product = pharmacyProduct?.product || null;
                  const categoryName = pharmacyProduct?.category?.category_name;
                  const isPrescribed = Boolean(
                    product?.is_prescribed || item.order_item_prescription,
                  );
                  const displayName =
                    product?.brand_name ||
                    product?.product_name ||
                    item.product_name ||
                    'Item';
                  const subtitle = [product?.generic_name, product?.strength]
                    .filter(Boolean)
                    .join(' • ');

                  return (
                    <View
                      key={item.id ?? index}
                      className={[
                        'flex-row items-center py-2',
                        index < items.length - 1 ? 'border-b border-slate-100' : '',
                      ].join(' ')}
                    >
                      <View style={ss.itemImgClip}>
                        <ProductImage
                          product={product}
                          categoryName={categoryName}
                          isPrescribed={isPrescribed}
                          width={44}
                          height={44}
                        />
                      </View>

                      <View className="flex-1 ml-2.5">
                        <View className="flex-row items-center gap-x-1.5">
                          <Text
                            className="text-[12px] text-slate-900 flex-1"
                            style={ss.semibold}
                            numberOfLines={1}
                          >
                            {displayName}
                          </Text>
                          {isPrescribed && (
                            <View className="bg-red-50 border border-red-200 rounded px-1.5 py-px">
                              <Text className="text-[10px] text-red-600" style={ss.bold}>
                                Rx
                              </Text>
                            </View>
                          )}
                        </View>

                        {!!subtitle && (
                          <Text
                            className="text-[11px] text-slate-400 mt-px"
                            style={ss.regular}
                            numberOfLines={1}
                          >
                            {subtitle}
                          </Text>
                        )}

                        <Text className="text-[11px] text-slate-500 mt-0.5" style={ss.medium}>
                          {'x'}{item.quantity}
                          {item.unit_price_snapshot
                            ? `  •  PHP ${Number(item.unit_price_snapshot).toFixed(2)}`
                            : ''}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Footer */}
            <View className="flex-row items-center justify-between px-3 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <View className="flex-row items-baseline gap-x-1.5">
                <Text className="text-[11px] text-slate-400" style={ss.regular}>
                  Total Amount
                </Text>
                <Text className="text-[14px]" style={[ss.bold, { color: colors.buttonColor }]}>
                  PHP {totalAmount}
                </Text>
              </View>

              {onPressDetails ? (
                <TouchableOpacity
                  className="flex-row items-center gap-x-0.5 px-2 py-1 rounded-lg bg-sky-50"
                  onPress={onPressDetails}
                  activeOpacity={0.7}
                >
                  <Text className="text-[11px]" style={[ss.semibold, { color: colors.buttonColor }]}>
                    View Details
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={15} color={colors.buttonColor} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  regular: { fontFamily: 'Poppins-Regular' },
  medium: { fontFamily: 'Poppins-Medium' },
  semibold: { fontFamily: 'Poppins-SemiBold' },
  bold: { fontFamily: 'Poppins-Bold' },

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  collapsedShadow: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },

  expandedContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  itemsScroll: {
    maxHeight: 220,
    paddingHorizontal: 12,
  },

  itemImgClip: {
    width: 44,
    height: 44,
    overflow: 'hidden',
  },

  scaleBadge: {
    transform: [{ scale: 0.85 }],
    marginLeft: 2,
  },
});
