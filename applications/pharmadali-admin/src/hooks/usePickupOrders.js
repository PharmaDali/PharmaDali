import { useState, useEffect, useCallback } from "react";
import { fetchPickupOrders } from "../services/posService";

/**
 * Custom hook to manage the count of ready-for-pickup orders.
 * Handles initial fetch and periodic polling.
 * 
 * @param {number} refreshInterval - Polling interval in milliseconds (default 30s)
 * @returns {object} { readyPickupCount, refreshCount }
 */
export const usePickupOrdersCount = (refreshInterval = 30000) => {
  const [readyPickupCount, setReadyPickupCount] = useState(0);

  const getPickupCount = useCallback(async () => {
    try {
      const response = await fetchPickupOrders({ status: "Ready" });
      if (response && response.status === "success") {
        const count = response.data.filter(o => o.status === "ready_for_pickup").length;
        setReadyPickupCount(count);
      }
    } catch (error) {
      console.error("Failed to fetch pickup count:", error);
    }
  }, []);

  useEffect(() => {
    getPickupCount();
    
    // Listen for manual updates (e.g. from PickUp page)
    window.addEventListener("order-status-updated", getPickupCount);

    if (refreshInterval > 0) {
      const interval = setInterval(getPickupCount, refreshInterval);
      return () => {
        clearInterval(interval);
        window.removeEventListener("order-status-updated", getPickupCount);
      };
    }

    return () => window.removeEventListener("order-status-updated", getPickupCount);
  }, [getPickupCount, refreshInterval]);

  return { readyPickupCount, refreshCount: getPickupCount };
};
