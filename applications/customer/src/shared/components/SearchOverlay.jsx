import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearch } from '@shared/hooks/useSearch';
import ProductCard from '@shared/components/ProductCard';
import { formatProductPrice } from '@shared/hooks/useHomeTab';
import { colors } from '@shared/theme/colorPalette';

const { height } = Dimensions.get('window');

export default function SearchOverlay({ visible, onClose, pharmacyId, onAddToCart }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const {
    results,
    isLoading,
    recentSearches,
    hasMore,
    nextCursor,
    performSearch,
    loadRecentSearches,
    clearRecentSearches,
  } = useSearch(pharmacyId);

  const searchTimeout = useRef(null);

  useEffect(() => {
    if (visible) {
      loadRecentSearches();
    }
  }, [visible, loadRecentSearches]);

  const handleSearchChange = (text) => {
    setQuery(text);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (text.trim().length >= 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(() => {
        performSearch(text);
        setIsSearching(false);
      }, 500); // 500ms debouncer
    } else {
      setIsSearching(false);
    }
  };

  const handleRecentClick = (q) => {
    setQuery(q);
    performSearch(q);
    Keyboard.dismiss();
  };

  const renderProduct = useCallback(({ item }) => (
    <View className="flex-1 p-1.5 items-center" style={{ maxWidth: '50%' }}>
      <ProductCard
        productId={item.product?.id}
        pharmacyProductId={item.id}
        pharmacyId={pharmacyId}
        img={item.product?.image_url ? { uri: item.product.image_url } : null}
        product={item.product}
        categoryName={item.category?.category_name}
        description={item.product?.brand_name || item.product?.generic_name || item.product?.product_name}
        category={item.category?.category_name}
        price={formatProductPrice(item.selling_price || item.price)}
        onAddToCart={onAddToCart}
        isPrescribed={Boolean(item.product?.is_prescribed)}
      />
    </View>
  ), [pharmacyId, onAddToCart]);

  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-white z-[1000]">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={onClose} className="mr-3">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 h-[45px]">
          <MaterialCommunityIcons name="magnify" size={20} color="#999" className="mr-2" />
          <TextInput
            className="flex-1 text-sm text-gray-700"
            style={{ fontFamily: 'Poppins-Regular' }}
            placeholder="Search for medicines, products..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={handleSearchChange}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => performSearch(query)}
          />
          {Boolean(query.length > 0) && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1">
        {query.trim().length < 2 ? (
          <View>
            <View className="flex-row justify-between items-center px-5 pt-5 pb-2.5">
              <Text className="text-base text-gray-700" style={{ fontFamily: 'Poppins-Bold' }}>Recent Searches</Text>
              {Boolean(recentSearches.length > 0) && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text className="text-xs" style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            {recentSearches.length > 0 ? (
              <View className="flex-row flex-wrap px-4">
                {recentSearches.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    className="flex-row items-center bg-sky-50 border border-sky-100 rounded-full px-3 py-1.5 m-1"
                    onPress={() => handleRecentClick(s)}
                  >
                    <MaterialCommunityIcons name="history" size={16} color={colors.buttonColor} />
                    <Text className="text-xs ml-1" style={styles.tagText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text className="text-center mt-5 text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>No recent searches</Text>
            )}
          </View>
        ) : isLoading || isSearching ? (
          <View className="flex-1 justify-center items-center pb-[100px]">
            <ActivityIndicator size="large" color={colors.buttonColor} />
            <Text className="mt-2.5 text-gray-700" style={{ fontFamily: 'Poppins-Medium' }}>Searching...</Text>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ padding: 12 }}
            showsVerticalScrollIndicator={false}
            onEndReached={() => hasMore && performSearch(query, nextCursor)}
            onEndReachedThreshold={0.5}
            initialNumToRender={6}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            ListFooterComponent={hasMore && <ActivityIndicator style={{ margin: 20 }} />}
          />
        ) : (
          <View className="flex-1 justify-center items-center pb-[100px]">
            <MaterialCommunityIcons name="magnify-close" size={64} color="#eee" />
            <Text className="text-center mt-5 text-gray-400" style={{ fontFamily: 'Poppins-Medium' }}>
              No products found for "{query}"
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clearText: {
    fontFamily: 'Poppins-Medium',
    color: colors.buttonColor,
  },
  tagText: {
    fontFamily: 'Poppins-Medium',
    color: colors.buttonColor,
  },
});
