import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearch } from '@shared/hooks/useSearch';
import ProductCard from '@shared/components/ProductCard';
import { formatProductPrice } from '@shared/hooks/useHomeTab';
import { useSelectionPhase } from '@shared/SelectionPhaseContext';
import { addBranchProductToCart } from '@shared/utils/cartUtils';
import { useToast } from '@shared/hooks/useToast';
import ToastMessage from '@shared/components/ToastMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchContext } from '@shared/SearchContext';

export default function SearchTab() {
  const insets = useSafeAreaInsets();
  const { selectedBranch } = useSelectionPhase();
  const branchId = selectedBranch?.id ?? selectedBranch?.branch_id;
  const { toast, showError } = useToast();
  const { searchQuery, setSearchQuery } = useSearchContext();
  
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const {
    results,
    isLoading,
    recentSearches,
    hasMore,
    nextCursor,
    performSearch,
    loadRecentSearches,
    clearRecentSearches,
  } = useSearch(branchId);

  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(() => {
        performSearch(searchQuery);
        setIsSearching(false);
      }, 500);
    } else {
      setIsSearching(false);
      if (searchQuery.trim().length === 0) {
        performSearch('');
      }
    }
  }, [searchQuery, performSearch]);

  const handleRecentClick = (q) => {
    setSearchQuery(q);
    Keyboard.dismiss();
  };

  const handleAddToCart = useCallback(({ branchProductId, quantity = 1 }) => {
    return addBranchProductToCart({
      branchId,
      branchProductId,
      quantity,
      validationMessages: {
        missingBranch: 'Please select a branch and try again.',
        missingProduct: 'Please select a branch and try again.',
      },
    }).then((result) => {
      if (!result.ok) {
        showError(result.errorMessage);
      }
      return result;
    });
  }, [branchId, showError]);

  const renderProduct = useCallback(({ item }) => (
    <View style={styles.productWrapper}>
      <ProductCard
        productId={item.product?.id}
        branchProductId={item.id}
        branchId={branchId}
        img={item.product?.image_url ? { uri: item.product.image_url } : null}
        product={item.product}
        categoryName={item.category?.category_name}
        description={item.product?.brand_name || item.product?.generic_name || item.product?.product_name}
        category={item.category?.category_name}
        price={formatProductPrice(item.selling_price || item.price)}
        onAddToCart={handleAddToCart}
        isPrescribed={Boolean(item.product?.is_prescribed)}
      />
    </View>
  ), [branchId, handleAddToCart]);

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
        {searchQuery.trim().length < 2 ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              {Boolean(recentSearches.length > 0) && (
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
          </View>
        ) : isLoading || isSearching ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#48AAD9" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={() => hasMore && performSearch(searchQuery, nextCursor)}
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
            <Text style={styles.emptyText}>No products found for "{searchQuery}"</Text>
          </View>
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
});
