import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@shared/theme/colorPalette';
import AddToCartIcon from '@assets/icons/add_to_cart_icon.svg';
import RxIcon from '@assets/icons/rx_icon.svg';
import ProductImage from '@shared/components/ProductImage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProductCard = ({
  img,
  product,
  categoryName,
  description,
  category,
  price,
  style,
  productId,
  branchProductId,
  branchId,
  onAddToCart,
  isPrescribed = false,
  isAvailable = true,
}) => {
  const router = useRouter();
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const handlePress = () => {
    router.push({
      pathname: '/tabs/shop/ProductView',
      params: {
        productId: productId || '1',
        branchProductId: branchProductId ? String(branchProductId) : '',
        branchId: branchId ? String(branchId) : '',
      },
    });
  };

  const handleAddToCartPress = (event) => {
    event?.stopPropagation?.();

    if (!isAvailable) {
      return;
    }

    setQuantity(1);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    setIsQuantityModalOpen(false);
    if (typeof onAddToCart === 'function') {
      const promise = onAddToCart({
        productId,
        branchProductId,
        branchId,
        quantity,
      });

      if (promise && typeof promise.then === 'function') {
        promise.then((result) => {
          if (result && result.ok) {
            setIsAddedSuccess(true);
            setTimeout(() => {
              setIsAddedSuccess(false);
            }, 2000);
          }
        });
      }
    }
  };

  return (
    <TouchableOpacity style={[{ width: 150 }, style]} onPress={handlePress}>
      <View className="rounded-xl bg-gray-50 p-3 border border-gray-200">
        <ProductImage
          source={img}
          product={product}
          categoryName={categoryName}
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
        
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-md" style={styles.priceBold}>{price}</Text>
          <TouchableOpacity
            onPress={handleAddToCartPress}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            disabled={!isAvailable || isAddedSuccess}
            style={!isAvailable ? styles.addToCartDisabled : null}
          >
            {isAddedSuccess ? (
              <View style={styles.addSuccessContainer}>
                <MaterialCommunityIcons name="check-bold" size={18} color="white" />
              </View>
            ) : (
              <AddToCartIcon width={28} height={28} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quantity Selection Modal Overlay */}
      <Modal
        visible={isQuantityModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsQuantityModalOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center px-5"
          activeOpacity={1}
          onPress={() => setIsQuantityModalOpen(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-[20px] p-5 w-full max-w-[320px] shadow-lg elevation-5"
            activeOpacity={1}
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
                <Text
                  className="text-[13px] mt-0.5 text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  {price}
                </Text>
              </View>
            </View>

            {/* Quantity selector adjustment controls */}
            <View className="flex-row justify-center items-center mb-5">
              <TouchableOpacity
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-[38px] h-[38px] rounded-[10px] border-2 border-[#48AAD9] justify-center items-center bg-white"
              >
                <Text
                  className="text-base text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  −
                </Text>
              </TouchableOpacity>
              <Text
                className="mx-[18px] text-base text-[#444444]"
                style={{ fontFamily: 'Poppins-Bold' }}
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(q => q + 1)}
                className="w-[38px] h-[38px] rounded-[10px] border-2 border-[#48AAD9] justify-center items-center bg-white"
              >
                <Text
                  className="text-base text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action buttons */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setIsQuantityModalOpen(false)}
                className="flex-1 py-3 mr-1.5 rounded-xl border border-gray-200 items-center justify-center"
              >
                <Text
                  className="text-[13px] text-gray-500"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmAddToCart}
                className="flex-1 py-3 ml-1.5 rounded-xl bg-[#48AAD9] items-center justify-center"
              >
                <Text
                  className="text-[13px] text-white"
                  style={{ fontFamily: 'Poppins-SemiBold' }}
                >
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
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

});

