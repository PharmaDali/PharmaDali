import { useState, useEffect, useCallback } from 'react';
import { getPharmacyOrders } from '@shared/services/orderToPharmacistService';

export function usePharmacistBadgeCounts() {
  const [ordersForReviewCount, setOrdersForReviewCount] = useState(0);
  const [readyForPickupCount, setReadyForPickupCount] = useState(0);

  const fetchBadgeCounts = useCallback(async () => {
    try {
      const [reviewRes, readyRes] = await Promise.all([
        getPharmacyOrders({ tab: 'for_review', page: 1, perPage: 1 }),
        getPharmacyOrders({ tab: 'for_pickup', page: 1, perPage: 1 }),
      ]);
      setOrdersForReviewCount(reviewRes?.total || 0);
      setReadyForPickupCount(readyRes?.total || 0);
    } catch {
      // Keep previous state on error
    }
  }, []);

  useEffect(() => {
    fetchBadgeCounts();
    const interval = setInterval(fetchBadgeCounts, 15000);
    return () => clearInterval(interval);
  }, [fetchBadgeCounts]);

  return {
    ordersForReviewCount,
    readyForPickupCount,
    refetch: fetchBadgeCounts,
  };
}
