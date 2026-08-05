import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@src/shared/theme/colorPalette';
import ArrowBackIcon from '@assets/icons/arrow_back_icon.svg';
import ProductImage from '@src/shared/components/ProductImage';
import ProductCard from '@src/shared/components/ProductCard';
import ArrowUpIcon from '@assets/icons/arrow_up_icon.svg';
import ArrowDownIcon from '@assets/icons/arrow_down_icon.svg';
import { addPharmacyProductToCart } from '@shared/utils/cartUtils';
import { getPharmacyProduct, getProducts } from '@shared/services/productService';
import ToastMessage from '@shared/components/ToastMessage';
import SkeletonProductView from '@src/shared/components/SkeletonProductView';
import { useToast } from '@shared/hooks/useToast';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProductView = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId, pharmacyProductId, pharmacyId } = useLocalSearchParams();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast, showSuccess, showError } = useToast();
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const [productData, setProductData] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProductData = async () => {
      try {
        const result = await getPharmacyProduct(pharmacyId, pharmacyProductId);
        if (!isMounted) return;

        if (result.status === 'success') {
          const productInfo = result.data;
          setProductData(productInfo);

          // Fetch similar products in the same category
          if (productInfo.category_id) {
            const similarResult = await getProducts(pharmacyId, productInfo.category_id, {
              perPage: 6,
            });
            if (isMounted && similarResult.status === 'success') {
              // Filter out the current product
              const filtered = similarResult.data.filter(
                (p) => String(p.id) !== String(pharmacyProductId)
              );
              setSimilarProducts(filtered);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        if (isMounted) {
          showError('Failed to load product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (pharmacyId && pharmacyProductId) {
      setLoading(true);
      fetchProductData();
    }

    return () => {
      isMounted = false;
    };
  }, [pharmacyId, pharmacyProductId]);

  const handleAddToCartPress = () => {
    setQuantity(1);
    setIsQuantityModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    setIsQuantityModalOpen(false);
    addPharmacyProductToCart({
      pharmacyId,
      pharmacyProductId,
      quantity,
      validationMessages: {
        missingProduct: 'Please add this item from the Shop list.',
        missingPharmacy: 'Please select a pharmacy first.',
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

  if (loading) {
    return <SkeletonProductView />;
  }

  if (!productData) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-5">
        <Text style={styles.fontMedium}>Product not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 py-2 px-4 bg-[#48AAD9] rounded-lg">
          <Text className="text-white">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { product, selling_price, category } = productData;
  const name = product?.product_name || product?.brand_name || 'Unnamed Product';
  const description = product?.description || 'No description available.';

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
        <View className="items-center bg-gray-50 py-4">
          <ProductImage
            product={product}
            categoryName={category?.category_name}
            width={260}
            height={260}
          />
        </View>

        <View className="px-5 pt-4 pb-3">
          <Text className="text-base" style={styles.productName}>
            {[name, product?.strength, product?.form, product?.size].filter(Boolean).join(' ')}
          </Text>
          <Text className="text-xl mt-2" style={styles.priceText}>
            PHP {Number(selling_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
              {description}
            </Text>
          </View>
        )}

        <View className="h-2 bg-gray-100" />

        <View className="px-5 pt-4 pb-6">
          <Text className="text-lg mb-3" style={styles.fontBold}>Similar Products</Text>
          {similarProducts.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item.product}
                  categoryName={item.category?.category_name}
                  description={`${item.product?.product_name || item.product?.brand_name} ${item.product?.strength || ''} ${item.product?.form || ''}`}
                  category={item.category?.category_name}
                  price={`PHP ${Number(item.selling_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                  productId={String(item.product_id)}
                  pharmacyProductId={String(item.id)}
                  pharmacyId={pharmacyId}
                  isPrescribed={Boolean(item.product?.is_prescribed)}
                  isAvailable={item.is_available}
                  style={{ width: 150, marginRight: 12 }}
                />
              ))}
            </ScrollView>
          ) : (
            <Text className="text-gray-400 italic">No similar products found.</Text>
          )}
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
              <ProductImage
                product={product}
                categoryName={category?.category_name}
                width={50}
                height={50}
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-[11px] text-gray-600"
                  style={{ fontFamily: 'Poppins-Medium' }}
                  numberOfLines={2}
                >
                  {name}
                </Text>
                <Text
                  className="text-[13px] mt-0.5 text-[#48AAD9]"
                  style={{ fontFamily: 'Poppins-Bold' }}
                >
                  PHP {Number(selling_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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

