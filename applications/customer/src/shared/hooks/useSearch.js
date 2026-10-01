import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchProducts, fetchSearchSuggestions, getProducts } from '@shared/services/productService';

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const searchCache = {
  pharmacyId: null,
  query: '',
  results: [],
  hasMore: false,
  nextCursor: null,
  recentSearches: null,
  searchSuggestionProducts: [],
  mode: 'idle',
  scrollOffset: 0,
  timestamp: 0,
};

export function useSearch(pharmacyId) {
  const isCached = Boolean(
    pharmacyId &&
    searchCache.pharmacyId === pharmacyId
  );

  const [results, setResults] = useState(isCached ? searchCache.results : []);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(searchCache.recentSearches || []);
  const [hasMore, setHasMore] = useState(isCached ? searchCache.hasMore : false);
  const [nextCursor, setNextCursor] = useState(isCached ? searchCache.nextCursor : null);
  const [suggestions, setSuggestions] = useState([]); // autocomplete name strings
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchSuggestionProducts, setSearchSuggestionProducts] = useState(
    isCached && searchCache.searchSuggestionProducts.length > 0 ? searchCache.searchSuggestionProducts : []
  );

  // Load recent searches from local storage
  const loadRecentSearches = useCallback(async () => {
    if (searchCache.recentSearches && searchCache.recentSearches.length > 0) {
      setRecentSearches(searchCache.recentSearches);
      return;
    }
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        searchCache.recentSearches = parsed;
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Save to recent searches
  const saveSearchQuery = useCallback(async (query) => {
    if (!query || query.trim() === '') return;

    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      let searches = stored ? JSON.parse(stored) : [];

      // Remove if already exists and add to front
      searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
      searches.unshift(query);

      // Limit size
      searches = searches.slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
      searchCache.recentSearches = searches;
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  }, []);

  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      searchCache.recentSearches = [];
      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }, []);

  // Fetch lightweight autocomplete suggestions (name strings only)
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const response = await fetchSearchSuggestions(pharmacyId, query);
      if (response && response.status === 'success') {
        setSuggestions(response.data || []);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    } finally {
      setSuggestionsLoading(false);
    }
  }, [pharmacyId]);

  // Load "Search Suggestions" product cards for the empty state
  const loadSearchSuggestionProducts = useCallback(async () => {
    if (searchCache.pharmacyId === pharmacyId && searchCache.searchSuggestionProducts.length > 0) {
      setSearchSuggestionProducts(searchCache.searchSuggestionProducts);
      return;
    }
    try {
      const response = await getProducts(pharmacyId, null, { perPage: 6 });
      // getProducts returns { status: 'success', data: [...] }
      const items = Array.isArray(response?.data) ? response.data : [];
      searchCache.pharmacyId = pharmacyId;
      searchCache.searchSuggestionProducts = items;
      setSearchSuggestionProducts(items);
    } catch (error) {
      console.error('Search suggestion products error:', error);
    }
  }, [pharmacyId]);

  const performSearch = useCallback(async (query, cursor = null) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      searchCache.results = [];
      searchCache.query = '';
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchProducts(pharmacyId, query, { cursor });
      if (response && response.status === 'success') {
        if (cursor) {
          const combined = [...searchCache.results, ...response.data];
          setResults(combined);
          searchCache.results = combined;
        } else {
          setResults(response.data);
          searchCache.pharmacyId = pharmacyId;
          searchCache.query = query;
          searchCache.results = response.data;
          searchCache.timestamp = Date.now();
          // Only save to recent searches on initial search
          saveSearchQuery(query);
        }
        searchCache.hasMore = response.has_more;
        searchCache.nextCursor = response.next_cursor;
        setHasMore(response.has_more);
        setNextCursor(response.next_cursor);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pharmacyId, saveSearchQuery]);

  return {
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
  };
}
