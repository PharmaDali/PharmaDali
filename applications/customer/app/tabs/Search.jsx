import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearch } from '@shared/hooks/useSearch';
import ProductCard from '@shared/components/ProductCard';
import { formatProductPrice } from '@shared/hooks/useHomeTab';
import { useSelectionPhase } from '@shared/context/SelectionPhaseContext';
import { addPharmacyProductToCart } from '@shared/utils/cartUtils';
import { useToast } from '@shared/hooks/useToast';
import ToastMessage from '@shared/components/ToastMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchContext } from '@shared/context/SearchContext';

export default function SearchTab() {
  const insets = useSafeAreaInsets();
  const { selectedPharmacy } = useSelectionPhase();
  const pharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id;
  const { toast, showError } = useToast();
  const { searchQuery, setSearchQuery, submitSignal } = useSearchContext();


  // 'idle' | 'suggesting' | 'loading' | 'results'
  const [mode, setMode] = useState('idle');
  const suggestDebounceRef = useRef(null);
  // Track the last query that the product grid was built for
  const committedQueryRef = useRef('');

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

  useEffect(() => {
    loadRecentSearches();
    loadSearchSuggestionProducts();
  }, [loadRecentSearches, loadSearchSuggestionProducts]);

  // When TopBar typing changes searchQuery — only fetch autocomplete, never auto-search
  useEffect(() => {
    if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);

    if (searchQuery.trim().length >= 2) {
      setMode('suggesting');
      suggestDebounceRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 200);
    } else {
      setMode('idle');
    }
  }, [searchQuery, fetchSuggestions]);

  // When user presses the keyboard Return/Search key on the TopBar
  useEffect(() => {
    if (submitSignal > 0) {
      commitSearch(searchQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitSignal]);

  // Commit a search — called on explicit user action only
  const commitSearch = useCallback((q) => {
    if (!q || q.trim().length < 2) return;
    committedQueryRef.current = q;
    setMode('loading');
    Keyboard.dismiss();
    performSearch(q).then(() => setMode('results'));
  }, [performSearch]);

  const handleSuggestionPress = (name) => {
    setSearchQuery(name);
    commitSearch(name);
  };

  const handleRecentClick = (q) => {
    setSearchQuery(q);
    commitSearch(q);
  };

  // Pressing the keyboard search key on the TopBar TextInput triggers this via searchQuery update,
  // but we need a way to also let the user confirm from the current TopBar query.
  // We expose this on the TopBar's onSubmitEditing via searchContext if needed — for now,
  // the suggestions list "confirm" button handles it.
  const handleSearchConfirm = () => {
    commitSearch(searchQuery);
  };

  const handleAddToCart = useCallback(({ pharmacyProductId, quantity = 1 }) => {
    return addPharmacyProductToCart({
      pharmacyId,
      pharmacyProductId,
      quantity,
      validationMessages: {
        missingPharmacy: 'Please select a pharmacy and try again.',
        missingProduct: 'Please select a pharmacy and try again.',
      },
    }).then((result) => {
      if (!result.ok) {
        showError(result.errorMessage);
      }
      return result;
    });
  }, [pharmacyId, showError]);

  const renderProduct = useCallback(({ item }) => {
    const isAvailable =
      (item.is_available === undefined ? true : Boolean(Number(item.is_available))) &&
      (item.is_expired === undefined ? true : !Boolean(Number(item.is_expired)));
    const isOutOfStock = Boolean(item.is_out_of_stock) || (item.stock !== undefined && Number(item.stock) <= 0);

    return (
      <View style={styles.productWrapper}>
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
          onAddToCart={handleAddToCart}
          isPrescribed={Boolean(item.product?.is_prescribed)}
          isAvailable={isAvailable}
          isOutOfStock={isOutOfStock}
          stock={item.stock}
          style={{ width: '100%' }}
        />
      </View>
    );
  }, [pharmacyId, handleAddToCart]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ToastMessage
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        topOffset={insets.top + 8}
      />

      <View style={styles.content}>

        {/* ── IDLE: recent searches + search suggestion cards ── */}
        {mode === 'idle' && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            {recentSearches.length > 0 ? (
              <View style={styles.recentTags}>
                {recentSearches.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.tag}
                    onPress={() => handleRecentClick(s)}
                  >
                    <MaterialCommunityIcons name="history" size={16} color="#48AAD9" />
                    <Text style={styles.tagText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No recent searches</Text>
            )}

            {searchSuggestionProducts.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                  <Text style={styles.sectionTitle}>Search Suggestions</Text>
                </View>
                <View style={styles.suggestionGrid}>
                  {searchSuggestionProducts.map((item) => {
                    const isAvailable =
                      (item.is_available === undefined ? true : Boolean(Number(item.is_available))) &&
                      (item.is_expired === undefined ? true : !Boolean(Number(item.is_expired)));
                    const isOutOfStock = Boolean(item.is_out_of_stock) || (item.stock !== undefined && Number(item.stock) <= 0);
                    return (
                      <View key={item.id} style={styles.suggestionCardItem}>

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
                          onAddToCart={handleAddToCart}
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

        {/* ── SUGGESTING: autocomplete name list ── */}
        {mode === 'suggesting' && (
          <View style={{ flex: 1 }}>
            {/* Confirm search row at top */}
            <TouchableOpacity style={styles.confirmRow} onPress={handleSearchConfirm}>
              <MaterialCommunityIcons name="magnify" size={18} color="#48AAD9" />
              <Text style={styles.confirmText} numberOfLines={1}>
                Search for "<Text style={{ fontFamily: 'Poppins-SemiBold' }}>{searchQuery}</Text>"
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#48AAD9" />
            </TouchableOpacity>

            {suggestionsLoading && suggestions.length === 0 ? (
              <ActivityIndicator size="small" color="#48AAD9" style={{ marginTop: 20 }} />
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {suggestions.map((name, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionRow}
                    onPress={() => handleSuggestionPress(name)}
                  >
                    <MaterialCommunityIcons name="magnify" size={18} color="#ccc" />
                    <Text style={styles.suggestionText} numberOfLines={1}>{name}</Text>
                    <MaterialCommunityIcons name="arrow-top-left" size={15} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* ── LOADING ── */}
        {mode === 'loading' && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#48AAD9" />
            <Text style={styles.loadingText}>Searching...</Text>
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
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onEndReached={() => hasMore && performSearch(committedQueryRef.current, nextCursor)}
              onEndReachedThreshold={0.5}
              initialNumToRender={6}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              ListFooterComponent={hasMore && <ActivityIndicator style={{ margin: 20 }} />}
            />
          ) : (
            <View style={styles.centerBox}>
              <MaterialCommunityIcons name="magnify-close" size={64} color="#eee" />
              <Text style={styles.emptyText}>No products found for "{committedQueryRef.current}"</Text>
            </View>
          )
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#444',
  },
  clearText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#48AAD9',
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#e0f2fe',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#48AAD9',
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Medium',
    color: '#999',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Poppins-Medium',
    color: '#48AAD9',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  listContent: {
    padding: 12,
  },
  productWrapper: {
    flex: 0.5,
    padding: 6,
    alignItems: 'center',
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  suggestionCardItem: {
    width: '50%',
    padding: 6,
  },


  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f9ff',
    gap: 10,
  },
  confirmText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#48AAD9',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#333',
  },
});
