import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@src/shared/theme/colorPalette';
import ProductImage from '@shared/components/ProductImage';
import { StatusBadge } from '@shared/components/OrderComponents';

export default function ChatOrderContextCard({ order, onPressDetails }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];
  const totalAmount = Number(order.total_amount ?? 0).toFixed(2);
  const orderNumberShort = order.order_number
    ? order.order_number.includes('-')
      ? order.order_number.split('-').pop()
      : order.order_number
    : String(order.id);

  /* ── Collapsed pill bar ── */
  if (isCollapsed) {
    return (
      <View className="px-3 pt-1.5 pb-0.5 bg-slate-50 z-10">
        <Pressable
          className="flex-row items-center justify-between bg-white rounded-xl px-3 py-1.5 border border-slate-200"
          style={ss.collapsedShadow}
          onPress={() => setIsCollapsed(false)}
          android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
        >
          <View className="flex-row items-center flex-1 gap-x-1.5">
            <Text className="text-[12px] text-slate-800" style={ss.semibold}>
              #{orderNumberShort}
            </Text>
            <Text className="text-[12px] text-slate-400">•</Text>
            <Text className="text-[12px]" style={[ss.bold, { color: colors.buttonColor }]}>
              PHP {totalAmount}
            </Text>
            <View style={ss.scaleBadge}>
              <StatusBadge status={order.status} />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsCollapsed(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>
        </Pressable>
      </View>
    );
  }

  /* ── Expanded card ── */
  return (
    <View className="px-3 pt-2 pb-1 bg-slate-50 z-10">
      <View className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={ss.cardShadow}>

        {/* Header */}
        <View className="flex-row items-center justify-between px-3 py-2.5 border-b border-slate-100">
          <View className="flex-row items-center flex-1 gap-x-2 flex-wrap">
            <Text className="text-[12px] text-slate-800" style={ss.semibold}>
              #{order.order_number || orderNumberShort}
            </Text>
            <StatusBadge status={order.status} />
          </View>
          <TouchableOpacity
            onPress={() => setIsCollapsed(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="chevron-up" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

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
              const product        = pharmacyProduct?.product || null;
              const categoryName   = pharmacyProduct?.category?.category_name;
              const isPrescribed   = Boolean(
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
                  {/* Thumbnail — clipped wrapper removes border, ProductImage handles the visual */}
                  <View style={ss.itemImgClip}>
                    <ProductImage
                      product={product}
                      categoryName={categoryName}
                      isPrescribed={isPrescribed}
                      width={44}
                      height={44}
                    />
                  </View>

                  {/* Details */}
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
        <View className="flex-row items-center justify-between px-3 py-2.5 border-t border-slate-100">
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
              className="flex-row items-center gap-x-0.5 px-1 py-0.5"
              onPress={onPressDetails}
              activeOpacity={0.7}
            >
              <Text className="text-[11px]" style={[ss.medium, { color: colors.buttonColor }]}>
                View Details
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={15} color={colors.buttonColor} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  regular:  { fontFamily: 'Poppins-Regular' },
  medium:   { fontFamily: 'Poppins-Medium' },
  semibold: { fontFamily: 'Poppins-SemiBold' },
  bold:     { fontFamily: 'Poppins-Bold' },

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

  itemsScroll: {
    maxHeight: 220,
    paddingHorizontal: 12,
  },

  /* Clips ProductImage's own border-radii to a clean rounded square — no border */
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
