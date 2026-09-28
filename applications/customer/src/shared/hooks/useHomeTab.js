import { useCallback, useEffect, useRef, useState } from 'react';
import { getPharmacyCategories, getProducts, getHeroRecommendations } from '@shared/services/productService';
import { getPharmacyById } from '@shared/services/selectionPhaseService';
import { formatTimeToAmPm, isPharmacyOpenNow } from '@src/utils/pickupScheduleUtils';

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
    return 'PHP 0.00';
  }

  return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const HOME_PREVIEW_LIMIT = 24;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh cache

const homeTabCache = {
  pharmacyId: null,
  categories: [],
  pharmacyProducts: [],
  heroRecommendations: null,
  recommendations: [],
  recHasMore: false,
  timestamp: 0,
};


export function useHomeTab(selectedPharmacy, setSelectedPharmacy) {
  const selectedPharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null;
  const isCached = Boolean(
    selectedPharmacyId &&
    homeTabCache.pharmacyId === selectedPharmacyId &&
    (homeTabCache.categories.length > 0 || homeTabCache.pharmacyProducts.length > 0)
  );

  const [currentPharmacyId, setCurrentPharmacyId] = useState(selectedPharmacyId);
  const [loading, setLoading] = useState(!selectedPharmacy || !isCached);
  const [categories, setCategories] = useState(isCached ? homeTabCache.categories : []);
  const [pharmacyProducts, setPharmacyProducts] = useState(isCached ? homeTabCache.pharmacyProducts : []);
  const [heroRecommendations, setHeroRecommendations] = useState(isCached ? homeTabCache.heroRecommendations : null);
  const [recommendations, setRecommendations] = useState(isCached ? homeTabCache.recommendations : []);
  const [recPage, setRecPage] = useState(1);
  const [recHasMore, setRecHasMore] = useState(isCached ? homeTabCache.recHasMore : false);
  const [isFetchingMoreRecs, setIsFetchingMoreRecs] = useState(false);
  const isFetchingMoreRecsRef = useRef(false);
  const previousPharmacyIdRef = useRef(null);
  const selectedPharmacyIdRef = useRef(selectedPharmacyId);
  selectedPharmacyIdRef.current = selectedPharmacyId;

  // React pattern: Synchronously adjust state during render when selectedPharmacyId changes
  // to prevent rendering stale data or having a frame delay before the skeleton appears
  if (selectedPharmacyId !== currentPharmacyId) {
    setCurrentPharmacyId(selectedPharmacyId);
    setLoading(true);
    setCategories([]);
    setPharmacyProducts([]);
    setHeroRecommendations(null);
    setRecommendations([]);
    setRecPage(1);
    setRecHasMore(false);
  }

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

    const targetPharmacyId = selectedPharmacyId;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [categoriesPayload, productsPayload, recommendationsPayload, pharmacyPayload] = await Promise.all([
        getPharmacyCategories(targetPharmacyId, isRefresh),
        getProducts(targetPharmacyId, null, { perPage: HOME_PREVIEW_LIMIT }),
        getHeroRecommendations(targetPharmacyId, { page: 1, perPage: 10 }).catch(() => null),
        typeof setSelectedPharmacy === 'function' ? getPharmacyById(targetPharmacyId).catch(() => null) : Promise.resolve(null),
      ]);

      // If another pharmacy was selected while this request was running, ignore this response
      if (selectedPharmacyIdRef.current !== targetPharmacyId) {
        return;
      }

      if (pharmacyPayload && typeof setSelectedPharmacy === 'function') {
        const pData = pharmacyPayload?.data ?? pharmacyPayload;
        if (pData && (pData.id || pData.pharmacy_id)) {
          const rawOpening = pData.opening_hour || pData.openingHour;
          const rawClosing = pData.closing_hour || pData.closingHour;
          const formattedOpeningHour = formatTimeToAmPm(rawOpening);
          const formattedClosingHour = formatTimeToAmPm(rawClosing);
          const isOperating = pData.is_active !== false && pData.is_active !== 0 && pData.is_active !== '0';
          const isOpen = isOperating && isPharmacyOpenNow(rawOpening, rawClosing);

          setSelectedPharmacy((prev) => ({
            ...prev,
            ...pData,
            name: pData.pharmacy_name || prev?.name,
            pharmacy_name: pData.pharmacy_name || prev?.pharmacy_name,
            address: pData.location || prev?.address,
            location: pData.location || prev?.location,
            opening_hour: rawOpening,
            closing_hour: rawClosing,
            openingHour: rawOpening,
            closingHour: rawClosing,
            formattedOpeningHour,
            formattedClosingHour,
            hours: formattedOpeningHour && formattedClosingHour
              ? `${formattedOpeningHour} - ${formattedClosingHour}`
              : (prev?.hours || 'Store hours unavailable'),
            isOpen,
            is_active: isOperating,
            isActive: isOperating,
            isOperating,
          }));
        }
      }

      const normCats = normalizeApiList(categoriesPayload);
      const normProds = normalizeApiList(productsPayload);
      setCategories(normCats);
      setPharmacyProducts(normProds);
      
      const recData = recommendationsPayload?.data ?? recommendationsPayload;
      let finalRecs = [];
      let finalHasMore = false;
      if (recData && (recData.hero_title || recData.recommendations)) {
        setHeroRecommendations(recData);
        finalRecs = recData.recommendations ?? [];
        finalHasMore = Boolean(recData.has_more);
        setRecommendations(finalRecs);
        setRecPage(1);
        setRecHasMore(finalHasMore);
      } else {
        setHeroRecommendations(null);
        setRecommendations([]);
        setRecPage(1);
        setRecHasMore(false);
      }

      // Update module-level cache
      homeTabCache.pharmacyId = targetPharmacyId;
      homeTabCache.categories = normCats;
      homeTabCache.pharmacyProducts = normProds;
      homeTabCache.heroRecommendations = recData;
      homeTabCache.recommendations = finalRecs;
      homeTabCache.recHasMore = finalHasMore;
      homeTabCache.timestamp = Date.now();
    } catch {
      if (selectedPharmacyIdRef.current === targetPharmacyId) {
        setCategories([]);
        setPharmacyProducts([]);
        setRecommendations([]);
        setRecPage(1);
        setRecHasMore(false);
      }
    } finally {
      if (selectedPharmacyIdRef.current === targetPharmacyId) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [selectedPharmacyId, setSelectedPharmacy]);

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
        let addedCount = 0;
        setRecommendations((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const filteredNew = newItems.filter((item) => !existingIds.has(item.id));
          addedCount = filteredNew.length;
          return filteredNew.length > 0 ? [...prev, ...filteredNew] : prev;
        });

        // If no new items were added (all were duplicates) or has_more is false, terminate pagination
        if (addedCount > 0 && recData?.has_more) {
          setRecPage(nextPage);
          setRecHasMore(true);
        } else {
          setRecHasMore(false);
        }
      } else {
        setRecHasMore(false);
      }
    } catch {
      setRecHasMore(false);
    } finally {
      isFetchingMoreRecsRef.current = false;
      setIsFetchingMoreRecs(false);
    }
  }, [recHasMore, selectedPharmacyId, loading, recPage]);

  useEffect(() => {
    if (!selectedPharmacyId) return;

    const isCacheFresh = Boolean(
      homeTabCache.pharmacyId === selectedPharmacyId &&
      homeTabCache.timestamp &&
      (Date.now() - homeTabCache.timestamp < CACHE_TTL_MS) &&
      (homeTabCache.categories.length > 0 || homeTabCache.pharmacyProducts.length > 0)
    );

    // If data was fetched within the last 60 seconds for this pharmacy AND it was already loaded, do NOT re-fetch on tab switch!
    if (isCacheFresh && previousPharmacyIdRef.current === selectedPharmacyId) {
      return;
    }

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
