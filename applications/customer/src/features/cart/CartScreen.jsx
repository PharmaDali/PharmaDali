import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@shared/theme/colorPalette';
import RxIcon from '@assets/icons/rx_icon.svg';
import InfoIcon from '@assets/icons/red_info_icon.svg';
import LocationIcon from '@assets/icons/red_location_icon.svg';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import { useCartTab } from '@shared/hooks/useCartTab';
import { setCheckoutDraft } from '@shared/services/checkoutDraft';
import ProductImage from '@shared/components/ProductImage';
import ClearCartOverlay from '@shared/components/ClearCartOverlay';

import DeleteIcon from '@assets/icons/delete.svg';

function Checkbox({ checked, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} className="mr-3 items-center justify-center">
      <View
        className={`w-5 h-5 rounded border-2 items-center justify-center ${
          checked ? 'bg-[#48AAD9] border-[#48AAD9]' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />}
      </View>
    </TouchableOpacity>
  );
}

function QuantityControl({ quantity, onIncrement, onDecrement }) {
  return (
    <View className="flex-row items-center border-2 border-[#48AAD9] rounded-full px-3 py-0.5 min-w-[80px] justify-between">
      <TouchableOpacity
        onPress={onDecrement}
        className="items-center justify-center"
      >
        <Text className="text-[#48AAD9] text-base" style={styles.fontSemiBold}>−</Text>
      </TouchableOpacity>
      <Text className="text-[#48AAD9] text-sm mx-2" style={styles.fontSemiBold}>{quantity}</Text>
      <TouchableOpacity
        onPress={onIncrement}
        className="items-center justify-center"
      >
        <Text className="text-[#48AAD9] text-base" style={styles.fontSemiBold}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function truncateText(value, maxLength = 48) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function CartItem({ item, onToggle, onIncrement, onDecrement, onRemove }) {
  const displayName = truncateText(item.description);

  return (
    <View className="flex-row items-start bg-white rounded-2xl border border-gray-200 p-3 mb-3" style={{ opacity: item.isAvailable === false ? 0.7 : 1 }}>
      {item.isAvailable !== false && (
        <Checkbox checked={item.selected} onPress={onToggle} />
      )}
      <ProductImage
        source={item?.img || item?.product?.image_url}
        product={item?.product}
        categoryName={item?.category?.category_name}
        quantity={item?.quantity}
        isPrescribed={item?.prescriptionRequired}
        isAvailable={item?.isAvailable}
        width={80}
        height={80}
        containerStyle={{ borderRadius: 8, marginLeft: item.isAvailable !== false ? 0 : 8 }}
      />
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-start">
          <Text className="text-xs flex-1 pr-2" style={styles.fontSemiBold} numberOfLines={2}>
            {displayName}
          </Text>
          <TouchableOpacity onPress={onRemove} className="p-1">
            <DeleteIcon width={18} height={18} />
          </TouchableOpacity>
        </View>
        {item.prescriptionRequired && (
          <View className="flex-row items-center mt-1">
            <RxIcon width={12} height={12} />
            <Text className="text-[10px] ml-1" style={styles.rxText}>Prescription Required</Text>
          </View>
        )}
        <Text className="text-[10px] text-gray-500 mt-1" style={styles.fontMedium}>
          {item.sizeLabel || 'Size'}: {item.size}
        </Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-sm" style={styles.priceText}>
            PHP {item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          {item.isAvailable !== false ? (
            <QuantityControl
              quantity={item.quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          ) : (
            <Text className="text-xs text-gray-400" style={styles.fontMedium}>Qty: {item.quantity}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cartItems,
    loading,
    errorMessage,
    loadCartItems,
    toggleItem,
    incrementQty,
    decrementQty,
    removeItem,
    clearAll,
    toggleAll,
    viewState,
    pharmacyLabel,
    pharmacyLocationLabel,
  } = useCartTab();

  const allSelected = viewState.allSelected;
  const total = viewState.total;
  const hasPrescription = viewState.hasPrescription;
  const isPharmacyOpen = viewState.isPharmacyOpen !== false;
  const closedPharmacyName = viewState.closedPharmacyName || '';
  const pharmacyHoursLabel = viewState.pharmacyHoursLabel || '';
  const canProceed = viewState.selectedCount > 0 && isPharmacyOpen;
  const selectedItems = cartItems.filter((item) => item.selected);

  const [showClearModal, setShowClearModal] = useState(false);

  const handleProceed = () => {
    if (!selectedItems.length || !isPharmacyOpen) {
      return;
    }

    setCheckoutDraft({
      items: selectedItems,
      pharmacyLabel,
      pharmacyLocationLabel,
      total,
    });

    router.push('/tabs/cart/ReviewOrder');
  };

  const handleConfirmClear = () => {
    setShowClearModal(false);
    clearAll();
  };

  return (
    <View className="flex-1 bg-[#F1F4FF]" style={{ paddingBottom: insets.bottom }}>
      <ClearCartOverlay
        visible={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
      />
      <View className="flex-row items-center justify-between px-5 pt-12 pb-4" style={styles.header}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowBackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text className="text-lg text-white" style={styles.fontSemiBold}>
            Shopping Cart ({cartItems.length})
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowClearModal(true)}>
          <Text className="text-white text-sm" style={styles.fontMedium}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-start bg-[#E8F4FD] rounded-xl mx-4 mt-4 p-3 border border-[#B8DEF0]">
        <LocationIcon width={17} height={17} />
        <View className="flex-1 ml-2">
          <Text className="text-xs" style={styles.fontSemiBold}>Pickup at {pharmacyLabel}</Text>
          {pharmacyLocationLabel ? (
            <Text className="text-[10px] text-gray-600 mt-0.5" style={styles.fontMedium}>
              {pharmacyLocationLabel}
            </Text>
          ) : null}
        </View>
      </View>

      {!loading && !errorMessage && !isPharmacyOpen && (
        <View className="mx-4 mt-3 bg-[#FFEAEA] border border-[#FFCCCC] rounded-xl p-3 flex-row items-center">
          <InfoIcon width={18} height={18} />
          <View className="flex-1 ml-2.5">
            <Text className="text-xs text-[#B42318]" style={styles.fontSemiBold}>
              Pharmacy is Currently Closed
            </Text>
            <Text className="text-[11px] text-[#7A271A] mt-0.5" style={styles.fontMedium}>
              {closedPharmacyName || 'Selected pharmacy'} is closed right now{pharmacyHoursLabel ? ` (${pharmacyHoursLabel})` : ''}. Orders cannot be processed until store opening.
            </Text>
          </View>
        </View>
      )}

      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        {loading && (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={colors.buttonColor} />
            <Text className="mt-3 text-xs text-gray-500" style={styles.fontMedium}>Loading cart items...</Text>
          </View>
        )}

        {!loading && !!errorMessage && (
          <View className="mx-4 bg-[#FFEAEA] border border-[#FFCCCC] rounded-xl p-3 mb-3">
            <Text className="text-xs text-[#B42318]" style={styles.fontMedium}>{errorMessage}</Text>
            <TouchableOpacity onPress={loadCartItems} className="mt-2 self-start px-3 py-1.5 bg-[#48AAD9] rounded-lg">
              <Text className="text-white text-xs" style={styles.fontSemiBold}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !errorMessage && cartItems.length === 0 && (
          <View className="mx-4 bg-white border border-gray-200 rounded-2xl p-5 items-center">
            <Text className="text-sm text-gray-600" style={styles.fontSemiBold}>Your cart is empty</Text>
            <Text className="text-xs text-gray-500 mt-1 text-center" style={styles.fontMedium}>
              Add products from a pharmacy to see them here.
            </Text>
          </View>
        )}

        {!loading && !errorMessage && (() => {
          const availableItems = cartItems.filter(i => i.isAvailable);
          const unavailableItems = cartItems.filter(i => !i.isAvailable);

          return (
            <View>
              <View className="px-4">
                {availableItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id)}
                    onIncrement={() => incrementQty(item.id)}
                    onDecrement={() => decrementQty(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </View>

              {unavailableItems.length > 0 && (
                <View className="mt-4 border-t border-gray-200 pt-4 px-4">
                  <Text className="text-sm mb-3" style={styles.fontBold}>Unavailable Items</Text>
                  <View className="bg-gray-100 rounded-xl p-3 mb-4">
                    <Text className="text-xs text-gray-600" style={styles.fontMedium}>
                      These items are out of stock and cannot be checked out.
                    </Text>
                  </View>
                  {unavailableItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onToggle={() => toggleItem(item.id)}
                      onIncrement={() => incrementQty(item.id)}
                      onDecrement={() => decrementQty(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })()}

        {hasPrescription && (
          <View className="flex-row items-center mx-4 mt-1 mb-2 gap-1">
            <InfoIcon width={15} height={15} />
            <Text className="text-[10px] text-gray-500" style={styles.fontMedium}>
              Prescription required for some items.
            </Text>
          </View>
        )}

      </ScrollView>

      <View className="bg-white border-t border-gray-200">
        {!loading && !errorMessage && cartItems.length > 0 && (
          <View className="flex-row items-center bg-[#F9F9F9] px-4 py-1.5 border-b border-gray-100">
            <InfoIcon width={12} height={12} />
            <Text className="text-[10px] text-gray-500 ml-1.5" style={styles.fontMedium}>
              Cart is grouped by your pharmacy selections.
            </Text>
          </View>
        )}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <Checkbox checked={allSelected} onPress={toggleAll} />
            <Text className="text-sm" style={styles.fontMedium}>All</Text>
          </View>
          <View className="flex-row items-center">
            <View className="mr-4">
              <Text className="text-xs text-gray-500" style={styles.fontMedium}>Total:</Text>
              <Text className="text-base" style={styles.totalPrice}>
                PHP {total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <TouchableOpacity
              className={`${canProceed ? 'bg-[#48AAD9]' : 'bg-gray-300'} rounded-xl px-6 py-2.5`}
              onPress={handleProceed}
              disabled={!canProceed}
            >
              <Text className="text-sm text-white" style={styles.fontSemiBold}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.buttonColor,
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  rxText: {
    fontFamily: 'Poppins-Medium',
  },
  totalPrice: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
});

