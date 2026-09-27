import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchProducts, fetchSearchSuggestions, getProducts } from '@shared/services/productService';

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function useSearch(pharmacyId) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [suggestions, setSuggestions] = useState([]); // autocomplete name strings
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchSuggestionProducts, setSearchSuggestionProducts] = useState([]); // empty-state product cards

  // Load recent searches from local storage
  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
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
      setRecentSearches(searches);
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  }, []);

  const clearRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
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
    try {
      const response = await getProducts(pharmacyId, null, { perPage: 6 });
      // getProducts returns { status: 'success', data: [...] }
      const items = Array.isArray(response?.data) ? response.data : [];
      setSearchSuggestionProducts(items);
    } catch (error) {
      console.error('Search suggestion products error:', error);
    }
  }, [pharmacyId]);


  const performSearch = useCallback(async (query, cursor = null) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchProducts(pharmacyId, query, { cursor });
      if (response && response.status === 'success') {
        if (cursor) {
          setResults(prev => [...prev, ...response.data]);
        } else {
          setResults(response.data);
          // Only save to recent searches on initial search
          saveSearchQuery(query);
        }
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
