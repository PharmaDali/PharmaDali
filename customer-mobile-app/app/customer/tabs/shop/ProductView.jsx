import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@src/shared/theme/colorPalette';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import ImageSlider from '@src/shared/components/ImageSlider';
import ProductCard from '@src/shared/components/ProductCard';
import BandaidImg from '@assets/images/bandaid_img.png';
import BetadineImg from '@assets/images/betadine_img.png';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import { addBranchProductToCart } from '@shared/utils/cartUtils';
import ToastMessage from '@shared/components/ToastMessage';
import { useToast } from '@shared/hooks/useToast';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const productData = {
  1: {
    name: 'OMRON MC-720 Digital Forehead Thermometer for Baby and Body Temperature',
    price: 3480.00,
    images: [BandaidImg, BandaidImg, BandaidImg],
    category: 'First Aid Accessories',
    details: 'OMRON Digital Forehead Thermometer MC720\n\nProvides non-contact forehead temperature measurement suitable for all ages, including infants and young children.\n\nThe Forehead Thermometer is non-intrusive. A measurement can be taken even while the child is sleeping. It offers a more comfortable temperature measurement especially for young children.\n\nBenefits of Omron Digital Forehead Thermometer:\n- Selectable °C / °F\n- Easy-to-Fold Design\n- Backlight\n- Last Reading on the Same Display with Current Reading\n- Silent Mode\n- 25 Memories\n- 3-in-1 Measurement\n- Gentle and Easy to Use',
  },
  2: {
    name: 'Betadine Antiseptic Povidone Iodine 10% 60ml',
    price: 109.00,
    images: [BetadineImg, BetadineImg],
    category: 'First Aid',
    details: 'Betadine Antiseptic Solution contains Povidone-Iodine 10% for the treatment and prevention of infection in minor cuts, wounds, and burns.',
  },
  default: {
    name: 'MEDIPLAST Sterilized Gauze Pads 4x4',
    price: 9.50,
    images: [BandaidImg],
    category: 'First Aid',
    details: 'Sterilized gauze pads for wound care and first aid treatment.',
  },
};

const similarProducts = [
  { img: BandaidImg, description: 'OMRON TH839S Digital Ear Thermometer for Baby...', category: 'First Aid Accessories', price: 'PHP 1,918.75' },
  { img: BetadineImg, description: 'SAFEPLUS Infrared Forehead Thermometer', category: 'First Aid Accessories', price: 'PHP 1,118.75' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: 'PHP 9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: 'PHP 109.00' },
];

const ProductView = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId, branchProductId, branchId } = useLocalSearchParams();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast, showSuccess, showError } = useToast();
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const product = productData[productId] || productData.default;

  const handleAddToCartPress = () => {
    setQuantity(1);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    setIsQuantityModalOpen(false);
    addBranchProductToCart({
      branchId,
      branchProductId,
      quantity,
      validationMessages: {
        missingProduct: 'Please add this item from the Shop list.',
        missingBranch: 'Please select a branch first.',
      },
    }).then((result) => {
      if (result && result.ok) {
        setIsAddedSuccess(true);
        setTimeout(() => {
          setIsAddedSuccess(false);
        }, 2000);
      } else if (result && !result.ok) {
        showError(result.errorMessage);
      }
    });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: insets.bottom }}>
      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={insets.top + 8}
      />
      <View className="flex-row items-center px-5 pt-12 pb-4" style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowBackIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ImageSlider images={product.images} height={260} />

        <View className="px-5 pt-4 pb-3">
          <Text className="text-base" style={styles.productName}>{product.name}</Text>
          <Text className="text-xl mt-2" style={styles.priceText}>
            PHP {product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View className="px-5 mb-4">
          <TouchableOpacity
            className={`rounded-xl py-3 items-center flex-row justify-center ${isAddedSuccess ? 'bg-[#059669]' : 'bg-[#48AAD9]'}`}
            onPress={handleAddToCartPress}
            disabled={isAddedSuccess}
          >
            {isAddedSuccess ? (
              <>
                <MaterialCommunityIcons name="check-circle" size={18} color="white" style={{ marginRight: 6 }} />
                <Text className="text-sm text-white" style={styles.fontSemiBold}>
                  Added to Cart
                </Text>
              </>
            ) : (
              <Text className="text-sm text-white" style={styles.fontSemiBold}>
                Add to cart
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="h-2 bg-gray-100" />

        <TouchableOpacity
          className="flex-row items-center justify-between px-5 py-4"
          onPress={() => setDetailsOpen(!detailsOpen)}
        >
          <Text className="text-base" style={styles.fontBold}>Product Details</Text>
          {detailsOpen ? <ArrowUpIcon width={24} height={24} className="text-gray-400" /> : <ArrowDownIcon width={24} height={24} className="text-gray-400" />}
        </TouchableOpacity>

        {detailsOpen && (
          <View className="px-5 pb-4">
            <Text className="text-sm text-gray-600 leading-5" style={styles.fontMedium}>
              {product.details}
            </Text>
          </View>
        )}

        <View className="h-2 bg-gray-100" />

        <View className="px-5 pt-4 pb-6">
          <Text className="text-lg mb-3" style={styles.fontBold}>Similar Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {similarProducts.map((item, index) => (
              <ProductCard
                key={index}
                img={item.img}
                description={item.description}
                category={item.category}
                price={item.price}
                style={{ width: 150, marginRight: 12 }}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

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
              style={{ fontFamily: 'Poppins-Bold', color: colors.textColor }}
            >
              Select Quantity
            </Text>

            {/* Product info preview */}
            <View className="flex-row items-center p-2.5 bg-gray-50 rounded-xl mb-5">
              <Image
                source={product.images[0]}
                className="w-[50px] h-[50px] rounded-md"
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-[11px] text-gray-600"
                  style={{ fontFamily: 'Poppins-Medium' }}
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <Text
                  className="text-[13px] mt-0.5 text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  PHP {product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
    </View>
  );
};

export default ProductView;

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.buttonColor,
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    color: colors.textColor,
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    color: colors.buttonColor,
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
    color: colors.textColor,
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
  },

});

