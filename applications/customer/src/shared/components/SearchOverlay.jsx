import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearch } from '@shared/hooks/useSearch';
import ProductCard from '@shared/components/ProductCard';
import { formatProductPrice } from '@shared/hooks/useHomeTab';
import { colors } from '@shared/theme/colorPalette';
import { stripEmojis } from '@src/shared/utils/inputSanitizers';

export default function SearchOverlay({ visible, onClose, pharmacyId, onAddToCart }) {
  const [query, setQuery] = useState('');
  // 'idle' | 'suggesting' | 'results' | 'loading'
  const [mode, setMode] = useState('idle');

  const {
    results,
    isLoading,
    recentSearches,
    hasMore,
    nextCursor,
    suggestions,
    suggestionsLoading,
    searchSuggestionProducts,
    performSearch,
    fetchSuggestions,
    loadRecentSearches,
    loadSearchSuggestionProducts,
    clearRecentSearches,
  } = useSearch(pharmacyId);

  const suggestDebounceRef = useRef(null);

  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      loadSearchSuggestionProducts();
    }
  }, [visible, loadRecentSearches, loadSearchSuggestionProducts]);

  // While typing — only fetch suggestions, never auto-trigger product search
  const handleSearchChange = (text) => {
    const clean = stripEmojis(text).slice(0, 100);
    setQuery(clean);

    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);

    if (clean.trim().length >= 2) {
      setMode('suggesting');
      suggestDebounceRef.current = setTimeout(() => {
        fetchSuggestions(clean);
      }, 200);
    } else {
      setMode('idle');
    }
  };

  // User explicitly picks a suggestion row → run full search
  const handleSuggestionPress = (name) => {
    setQuery(name);
    setMode('loading');
    Keyboard.dismiss();
    performSearch(name).then(() => setMode('results'));
  };

  // User taps a recent search chip → run full search
  const handleRecentClick = (q) => {
    setQuery(q);
    setMode('loading');
    performSearch(q).then(() => setMode('results'));
    Keyboard.dismiss();
  };

  // User presses the keyboard search button → run full search
  const handleSubmit = () => {
    if (query.trim().length >= 2) {
      if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
      setMode('loading');
      Keyboard.dismiss();
      performSearch(query).then(() => setMode('results'));
    }
  };

  const handleClear = () => {
    setQuery('');
    setMode('idle');
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
  };

  const renderProduct = ({ item }) => {
    const isAvailable =
      (item.is_available === undefined ? true : Boolean(Number(item.is_available))) &&
      (item.is_expired === undefined ? true : !Boolean(Number(item.is_expired)));
    const isOutOfStock = Boolean(item.is_out_of_stock) || (item.stock !== undefined && Number(item.stock) <= 0);

    return (
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
          isAvailable={isAvailable}
          isOutOfStock={isOutOfStock}
          stock={item.stock}
          style={{ width: '100%' }}
        />
      </View>
    );
  };

  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-white z-[1000]">
      {/* Search bar — style unchanged */}
      <View className="flex-row items-center px-4 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={onClose} className="mr-3">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#444" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 h-[45px]">
          <MaterialCommunityIcons name="magnify" size={20} color="#999" className="mr-2" />
          <TextInput
            className="flex-1 text-sm"
            style={{ fontFamily: 'Poppins-Regular', color: '#444444' }}
            placeholder="Search for medicines, products..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={handleSearchChange}
            maxLength={100}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="flex-1">

        {/* ── IDLE: recent searches + suggestion product cards ── */}
        {mode === 'idle' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Recent searches — style unchanged */}
            <View className="flex-row justify-between items-center px-5 pt-5 pb-2.5">
              <Text className="text-base text-gray-700" style={{ fontFamily: 'Poppins-Bold' }}>Recent Searches</Text>
              {recentSearches.length > 0 && (
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

            {/* Search Suggestions product cards */}
            {searchSuggestionProducts.length > 0 && (
              <>
                <View className="flex-row justify-between items-center px-5 pt-6 pb-2.5">
                  <Text className="text-base text-gray-700" style={{ fontFamily: 'Poppins-Bold' }}>Search Suggestions</Text>
                </View>
                <View style={styles.suggestionsGrid}>
                  {searchSuggestionProducts.map((item) => {
                    const isAvailable =
                      (item.is_available === undefined ? true : Boolean(Number(item.is_available))) &&
                      (item.is_expired === undefined ? true : !Boolean(Number(item.is_expired)));
                    const isOutOfStock = Boolean(item.is_out_of_stock) || (item.stock !== undefined && Number(item.stock) <= 0);
                    return (
                      <View key={item.id} style={styles.suggestionCardWrapper}>
                        <ProductCard
                          productId={item.product?.id ?? item.product_id}
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
                          isAvailable={isAvailable}
                          isOutOfStock={isOutOfStock}
                          stock={item.stock}
                          style={{ width: '100%' }}
                        />
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>
        )}

        {/* ── SUGGESTING: autocomplete name list (like YouTube search) ── */}
        {mode === 'suggesting' && (
          <View className="flex-1">
            {suggestionsLoading && suggestions.length === 0 ? (
              <ActivityIndicator size="small" color={colors.buttonColor} style={{ marginTop: 24 }} />
            ) : suggestions.length > 0 ? (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {suggestions.map((name, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionRow}
                    onPress={() => handleSuggestionPress(name)}
                  >
                    <MaterialCommunityIcons name="magnify" size={18} color="#bbb" />
                    <Text style={styles.suggestionText} numberOfLines={1}>{name}</Text>
                    <MaterialCommunityIcons name="arrow-top-left" size={15} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              // No suggestions yet (still debouncing) — show nothing
              null
            )}
          </View>
        )}

        {/* ── LOADING: full search in progress ── */}
        {mode === 'loading' && (
          <View className="flex-1 justify-center items-center pb-[100px]">
            <ActivityIndicator size="large" color={colors.buttonColor} />
            <Text className="mt-2.5 text-gray-700" style={{ fontFamily: 'Poppins-Medium' }}>Searching...</Text>
          </View>
        )}

        {/* ── RESULTS: product grid ── */}
        {mode === 'results' && (
          results.length > 0 ? (
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
          )
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
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#333',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  suggestionCardWrapper: {
    width: '50%',
    padding: 6,
  },
});
