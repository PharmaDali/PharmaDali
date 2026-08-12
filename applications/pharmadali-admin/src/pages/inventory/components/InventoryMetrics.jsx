import React from "react";
import { Skeleton } from "../../../components/loading";

export function InventoryMetrics({
  loading,
  totalItems,
  lowStockCount,
  expiringSoonCount,
  expiredCount,
}) {
  return (
    <div className="inventory-metrics">
      <article className="inventory-metric-card inventory-metric-total">
        <p className="inventory-metric-label mb-1">Total Products</p>
        <p className="inventory-metric-value mb-0">
          {loading ? <Skeleton width="60px" height="28px" /> : totalItems}
        </p>
      </article>
      <article className="inventory-metric-card inventory-metric-low">
        <p className="inventory-metric-label mb-1">Low Stocks</p>
        <p className="inventory-metric-value mb-0">
          {loading ? <Skeleton width="50px" height="28px" /> : lowStockCount}
        </p>
      </article>
      <article className="inventory-metric-card inventory-metric-expiring">
        <p className="inventory-metric-label mb-1">Expiring</p>
        <p className="inventory-metric-value mb-0">
          {loading ? <Skeleton width="50px" height="28px" /> : expiringSoonCount}
        </p>
      </article>
      <article className="inventory-metric-card inventory-metric-expired">
        <p className="inventory-metric-label mb-1">Expired</p>
        <p className="inventory-metric-value mb-0">
          {loading ? <Skeleton width="50px" height="28px" /> : expiredCount}
        </p>
      </article>
    </div>
  );
}

export default InventoryMetrics;
