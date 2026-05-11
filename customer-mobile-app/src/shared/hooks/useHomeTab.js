import { useCallback, useEffect, useRef, useState } from 'react';
import { getBranchCategories, getProducts } from '@shared/services/productService';

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

export function useHomeTab(selectedBranch) {
  const selectedBranchId = selectedBranch?.id ?? selectedBranch?.branch_id ?? null;

  const [loading, setLoading] = useState(!selectedBranch);
  const [categories, setCategories] = useState([]);
  const [branchProducts, setBranchProducts] = useState([]);
  const previousBranchIdRef = useRef(null);

  useEffect(() => {
    if (selectedBranch) return;

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedBranch]);

  useEffect(() => {
    if (!selectedBranchId) {
      return;
    }

    let mounted = true;
    previousBranchIdRef.current = selectedBranchId;

    async function loadBranchData() {
      setLoading(true);

      try {
        const [categoriesPayload, productsPayload] = await Promise.all([
          getBranchCategories(selectedBranchId),
          getProducts(selectedBranchId, null, { perPage: HOME_PREVIEW_LIMIT }),
        ]);

        if (!mounted) {
          return;
        }

        setCategories(normalizeApiList(categoriesPayload));
        setBranchProducts(normalizeApiList(productsPayload));
      } catch {
        if (mounted) {
          setCategories([]);
          setBranchProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBranchData();

    return () => {
      mounted = false;
    };
  }, [selectedBranchId]);

  const normalizeSelectedBranch = useCallback((branch) => ({
    ...branch,
    id: branch?.id ?? branch?.branch_id ?? null,
  }), []);

  return {
    loading,
    categories,
    branchProducts,
    normalizeSelectedBranch,
  };
}
