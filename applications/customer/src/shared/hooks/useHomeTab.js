import { useCallback, useEffect, useRef, useState } from 'react';
import { getPharmacyCategories, getProducts, getHeroRecommendations } from '@shared/services/productService';

function normalizeApiList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export function formatProductPrice(value) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) {
    return 'P0.00';
  }

  return `P${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const HOME_PREVIEW_LIMIT = 24;

export function useHomeTab(selectedPharmacy) {
  const selectedPharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null;

  const [loading, setLoading] = useState(!selectedPharmacy);
  const [categories, setCategories] = useState([]);
  const [pharmacyProducts, setPharmacyProducts] = useState([]);
  const [heroRecommendations, setHeroRecommendations] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recPage, setRecPage] = useState(1);
  const [recHasMore, setRecHasMore] = useState(false);
  const [isFetchingMoreRecs, setIsFetchingMoreRecs] = useState(false);
  const isFetchingMoreRecsRef = useRef(false);
  const previousPharmacyIdRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedPharmacy) return;

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedPharmacy]);

  const loadPharmacyData = useCallback(async (isRefresh = false) => {
    if (!selectedPharmacyId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [categoriesPayload, productsPayload, recommendationsPayload] = await Promise.all([
        getPharmacyCategories(selectedPharmacyId, isRefresh),
        getProducts(selectedPharmacyId, null, { perPage: HOME_PREVIEW_LIMIT }),
        getHeroRecommendations(selectedPharmacyId, { page: 1, perPage: 10 }).catch(() => null),
      ]);

      setCategories(normalizeApiList(categoriesPayload));
      setPharmacyProducts(normalizeApiList(productsPayload));
      
      const recData = recommendationsPayload?.data ?? recommendationsPayload;
      if (recData && (recData.hero_title || recData.recommendations)) {
        setHeroRecommendations(recData);
        setRecommendations(recData.recommendations ?? []);
        setRecPage(1);
        setRecHasMore(Boolean(recData.has_more));
      } else {
        setRecommendations([]);
        setRecPage(1);
        setRecHasMore(false);
      }
    } catch {
      setCategories([]);
      setPharmacyProducts([]);
      setRecommendations([]);
      setRecPage(1);
      setRecHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPharmacyId]);

  const loadMoreRecommendations = useCallback(async () => {
    if (isFetchingMoreRecsRef.current || !recHasMore || !selectedPharmacyId || loading) {
      return;
    }

    isFetchingMoreRecsRef.current = true;
    setIsFetchingMoreRecs(true);

    try {
      const nextPage = recPage + 1;
      const res = await getHeroRecommendations(selectedPharmacyId, { page: nextPage, perPage: 10 });
      const recData = res?.data ?? res;
      const newItems = recData?.recommendations ?? [];

      if (newItems.length > 0) {
        setRecommendations((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const filteredNew = newItems.filter((item) => !existingIds.has(item.id));
          return [...prev, ...filteredNew];
        });
        setRecPage(nextPage);
      }
      setRecHasMore(Boolean(recData?.has_more));
    } catch {
      // Silently fail — user can scroll again
    } finally {
      isFetchingMoreRecsRef.current = false;
      setIsFetchingMoreRecs(false);
    }
  }, [recHasMore, selectedPharmacyId, loading, recPage]);

  useEffect(() => {
    if (!selectedPharmacyId) return;
    previousPharmacyIdRef.current = selectedPharmacyId;
    loadPharmacyData(false);
  }, [selectedPharmacyId, loadPharmacyData]);

  const refetch = useCallback(() => {
    return loadPharmacyData(true);
  }, [loadPharmacyData]);

  const normalizeSelectedPharmacy = useCallback((pharmacy) => ({
    ...pharmacy,
    id: pharmacy?.id ?? pharmacy?.pharmacy_id ?? null,
  }), []);

  return {
    loading,
    refreshing,
    refetch,
    categories,
    pharmacyProducts,
    heroRecommendations,
    recommendations,
    recHasMore,
    isFetchingMoreRecs,
    loadMoreRecommendations,
    normalizeSelectedPharmacy,
  };
}
