import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@shared/theme/colorPalette';
import AddToCartIcon from '@assets/icons/add_to_cart_icon.svg';
import RxIcon from '@assets/icons/rx_icon.svg';
import ProductImage from '@shared/components/ProductImage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatStockLeft, getStockTextColor } from '@shared/utils/stringUtils';

import { useFlyToCart } from '@shared/context/FlyToCartContext';
import { useFontSize } from '@shared/context/FontSizeContext';

const ProductCard = ({
  img,
  product,
  categoryName,
  description,
  category,
  price,
  style,
  productId,
  pharmacyProductId,
  pharmacyId,
  onAddToCart,
  isPrescribed = false,
  isAvailable = true,
  isOutOfStock = false,
  stock = undefined,
}) => {
  const router = useRouter();
  const { triggerFlyToCart } = useFlyToCart();
  const { scaleFontSize } = useFontSize();
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [tapPos, setTapPos] = useState({ x: null, y: null });

  const isOutOfStockComputed = Boolean(isOutOfStock) || (stock !== undefined && stock !== null && Number(stock) <= 0);
  const canAddToCart = isAvailable !== false && !isOutOfStockComputed;
  const stockLabel = formatStockLeft(stock);
  const stockTextColor = getStockTextColor(stock);

  const handlePress = () => {
    router.push({
      pathname: '/tabs/shop/ProductView',
      params: {
        productId: productId || '1',
        pharmacyProductId: pharmacyProductId ? String(pharmacyProductId) : '',
        pharmacyId: pharmacyId ? String(pharmacyId) : '',
      },
    });
  };

  const handleAddToCartPress = (event) => {
    event?.stopPropagation?.();

    if (!canAddToCart) {
      return;
    }

    if (event?.nativeEvent?.pageX && event?.nativeEvent?.pageY) {
      setTapPos({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    }

    setQuantity(1);
    setIsQuantityModalOpen(true);
  };

  const availableStock = (stock !== undefined && stock !== null) ? Number(stock) : null;
  const hasStockLimit = availableStock !== null && !Number.isNaN(availableStock);
  const maxStock = hasStockLimit ? Math.max(0, availableStock) : 999;

  const numQuantity = Number(quantity);
  const isExceeded = hasStockLimit && numQuantity > maxStock;
  const isBelowMin = !quantity || numQuantity < 1;
  const isQuantityInvalid = isExceeded || isBelowMin;

  const handleQuantityChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(cleaned, 10);
    setQuantity(num);
  };

  const handleQuantityBlur = () => {
    if (!quantity || Number(quantity) < 1) {
      setQuantity(1);
    }
  };

  const handleIncrement = () => {
    setQuantity((q) => {
      const current = Number(q) || 0;
      if (hasStockLimit && current >= maxStock) {
        return current;
      }
      return current + 1;
    });
  };

  const handleDecrement = () => {
    setQuantity((q) => {
      const current = Number(q) || 1;
      return Math.max(1, current - 1);
    });
  };

  const handleConfirmAddToCart = () => {
    const finalQuantity = Number(quantity);
    if (!finalQuantity || finalQuantity < 1 || (hasStockLimit && finalQuantity > maxStock)) {
      return;
    }
    setIsQuantityModalOpen(false);
    if (typeof onAddToCart === 'function') {
      const promise = onAddToCart({
        productId,
        pharmacyProductId,
        pharmacyId,
        quantity: finalQuantity,
      });

      if (promise && typeof promise.then === 'function') {
        promise.then((result) => {
          if (result && result.ok) {
            setIsAddedSuccess(true);
            triggerFlyToCart({
              startX: tapPos.x,
              startY: tapPos.y,
              img: img || product?.image_url,
              product: product,
            });
            setTimeout(() => {
              setIsAddedSuccess(false);
            }, 2000);
          }
        });
      }
    }
  };

  return (
    <>
      <TouchableOpacity style={[{ width: 150 }, style]} onPress={handlePress}>
        <View className="rounded-xl bg-gray-50 p-3 border border-gray-200">
          <ProductImage
            source={img}
            product={product}
            categoryName={categoryName}
            isAvailable={isAvailable}
            isOutOfStock={isOutOfStockComputed}
            stock={stock}
            width={120}
            height={120}
            containerStyle={{ borderRadius: 8, alignSelf: 'center' }}
          />
          <Text
            className="text-xs text-gray-600 mt-2"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontFamily: 'Poppins-Medium' }}
          >
            {category}
          </Text>
          {Boolean(isPrescribed) && (
            <View className="flex-row items-center mt-1">
              <RxIcon width={12} height={12} />
              <Text className="text-[10px] ml-1" style={styles.rxText}>Prescription Required</Text>
            </View>
          )}
          <Text className="text-sm mt-2" style={{ fontFamily: 'Poppins-Medium' }} numberOfLines={2}>{description}</Text>

          {/* Stocks left indicator */}
          {stockLabel && (
            <Text
              style={{
                fontSize: scaleFontSize(11),
                fontFamily: 'Poppins-Medium',
                color: stockTextColor,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {stockLabel}
            </Text>
          )}

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-base" style={styles.priceBold}>{price}</Text>
            <TouchableOpacity
              onPress={handleAddToCartPress}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              disabled={!canAddToCart}
              style={!canAddToCart ? styles.addToCartDisabled : null}
            >
              <AddToCartIcon width={28} height={28} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quantity Selection Modal Overlay */}
      <Modal
        visible={isQuantityModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsQuantityModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          {/* Backdrop dismiss press */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsQuantityModalOpen(false)}
          >
            <View style={StyleSheet.absoluteFill} className="bg-black/50" />
          </Pressable>

          {/* Dialog Card - plain View so TextInput can be focused without touch responder blocking */}
          <View
            className="bg-white rounded-[20px] p-5 w-full max-w-[320px] shadow-lg elevation-5"
            style={{ zIndex: 10 }}
          >
            <Text
              className="text-base text-center mb-4"
              style={{ fontFamily: 'Poppins-Bold', color: '#444444' }}
            >
              Select Quantity
            </Text>

            {/* Product info preview */}
            <View className="flex-row items-center p-2.5 bg-gray-50 rounded-xl mb-5">
              <ProductImage
                source={img}
                product={product}
                categoryName={categoryName}
                width={50}
                height={50}
                containerStyle={{ borderRadius: 6, alignSelf: 'center' }}
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-[11px] text-gray-600"
                  style={{ fontFamily: 'Poppins-Medium' }}
                  numberOfLines={2}
                >
                  {description}
                </Text>
                <View className="flex-row items-center justify-between mt-1">
                  <Text
                    className="text-sm text-[#48AAD9]"
                    style={{ fontFamily: 'Poppins-Bold' }}
                  >
                    {price}
                  </Text>
                  {stockLabel && (
                    <Text
                      style={{
                        fontSize: scaleFontSize(11),
                        fontFamily: 'Poppins-Medium',
                        color: stockTextColor,
                      }}
                    >
                      {stockLabel}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Quantity selector adjustment controls */}
            <View className="flex-row justify-center items-center mb-3">
              <TouchableOpacity
                onPress={handleDecrement}
                disabled={Number(quantity) <= 1}
                className="w-[38px] h-[38px] rounded-[10px] border-2 border-[#48AAD9] justify-center items-center bg-white"
                style={Number(quantity) <= 1 ? { opacity: 0.35 } : null}
              >
                <Text
                  className="text-base text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  −
                </Text>
              </TouchableOpacity>
              <TextInput
                value={String(quantity)}
                onChangeText={handleQuantityChange}
                onBlur={handleQuantityBlur}
                keyboardType="number-pad"
                returnKeyType="done"
                selectTextOnFocus
                textAlign="center"
                style={[
                  styles.quantityInput,
                  isQuantityInvalid && styles.quantityInputError,
                ]}
              />
              <TouchableOpacity
                onPress={handleIncrement}
                disabled={hasStockLimit && (Number(quantity) >= maxStock || isExceeded)}
                className="w-[38px] h-[38px] rounded-[10px] border-2 border-[#48AAD9] justify-center items-center bg-white"
                style={hasStockLimit && (Number(quantity) >= maxStock || isExceeded) ? { opacity: 0.35 } : null}
              >
                <Text
                  className="text-base text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error or max stock warning */}
            {isExceeded && (
              <Text
                className="text-xs text-center text-red-500 mb-3"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Quantity exceeds available stock ({maxStock} available)
              </Text>
            )}

            {!isExceeded && isBelowMin && quantity !== '' && (
              <Text
                className="text-xs text-center text-red-500 mb-3"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Quantity must be at least 1
              </Text>
            )}

            {!isExceeded && !isBelowMin && hasStockLimit && numQuantity === maxStock && maxStock > 0 && (
              <Text
                className="text-[11px] text-center text-amber-600 mb-3"
                style={{ fontFamily: 'Poppins-Medium' }}
              >
                Maximum available stock reached ({maxStock})
              </Text>
            )}

            {/* Action buttons */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setIsQuantityModalOpen(false)}
                className="flex-1 py-3 mr-1.5 rounded-xl border border-gray-200 items-center justify-center"
              >
                <Text
                  className="text-sm text-gray-500"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmAddToCart}
                disabled={isQuantityInvalid}
                className={`flex-1 py-3 ml-1.5 rounded-xl items-center justify-center ${
                  isQuantityInvalid ? 'bg-gray-300' : 'bg-[#48AAD9]'
                }`}
              >
                <Text
                  className="text-sm text-white"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  priceBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  rxText: {
    fontFamily: 'Poppins-Medium',
    color: '#DC3545',
  },
  addToCartDisabled: {
    opacity: 0.35,
  },
  addSuccessContainer: {
    width: 28,
    height: 28,
    backgroundColor: '#059669',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  quantityInput: {
    width: 60,
    height: 38,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#444444',
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  quantityInputError: {
    borderColor: '#EF4444',
    color: '#EF4444',
  },
});

