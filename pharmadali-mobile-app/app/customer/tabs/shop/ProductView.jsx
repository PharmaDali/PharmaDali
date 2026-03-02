import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@shared/colorPallete';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import ImageSlider from '@shared/components/ImageSlider';
import ProductCard from '@shared/components/ProductCard';
import BandaidImg from '@assets/images/bandaid_img.png';
import BetadineImg from '@assets/images/betadine_img.png';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';

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
  { img: BandaidImg, description: 'OMRON TH839S Digital Ear Thermometer for Baby...', category: 'First Aid Accessories', price: '₱1,918.75' },
  { img: BetadineImg, description: 'SAFEPLUS Infrared Forehead Thermometer', category: 'First Aid Accessories', price: '₱1,118.75' },
  { img: BandaidImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', category: 'First Aid', price: '₱9.50' },
  { img: BetadineImg, description: 'Betadine Antiseptic Povidone Iodine 10% 60ml', category: 'First Aid', price: '₱109.00' },
];

const ProductView = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const product = productData[productId] || productData.default;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
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
            ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View className="px-5 mb-4">
          <TouchableOpacity
            className="bg-[#48AAD9] rounded-xl py-3 items-center"
            onPress={() => {}}
          >
            <Text className="text-sm text-white" style={styles.fontSemiBold}>Add to cart</Text>
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
    </SafeAreaView>
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
