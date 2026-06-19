import { useCallback, useEffect, useRef, useState } from 'react';
import { getPharmacyCategories, getProducts } from '@shared/services/productService';

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

const HOME_PREVIEW_LIMIT = 10;

export function useHomeTab(selectedPharmacy) {
  const selectedPharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id ?? null;

  const [loading, setLoading] = useState(!selectedPharmacy);
  const [categories, setCategories] = useState([]);
  const [pharmacyProducts, setPharmacyProducts] = useState([]);
  const previousPharmacyIdRef = useRef(null);

  useEffect(() => {
    if (selectedPharmacy) return;

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedPharmacy]);

  useEffect(() => {
    if (!selectedPharmacyId) {
      return;
    }

    let mounted = true;
    previousPharmacyIdRef.current = selectedPharmacyId;

    async function loadPharmacyData() {
      setLoading(true);

      try {
        const [categoriesPayload, productsPayload] = await Promise.all([
          getPharmacyCategories(selectedPharmacyId),
          getProducts(selectedPharmacyId, null, { perPage: HOME_PREVIEW_LIMIT }),
        ]);

        if (!mounted) {
          return;
        }

        setCategories(normalizeApiList(categoriesPayload));
        setPharmacyProducts(normalizeApiList(productsPayload));
      } catch {
        if (mounted) {
          setCategories([]);
          setPharmacyProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPharmacyData();

    return () => {
      mounted = false;
    };
  }, [selectedPharmacyId]);

  const normalizeSelectedPharmacy = useCallback((pharmacy) => ({
    ...pharmacy,
    id: pharmacy?.id ?? pharmacy?.pharmacy_id ?? null,
  }), []);

  return {
    loading,
    categories,
    pharmacyProducts,
    normalizeSelectedPharmacy,
  };
}
