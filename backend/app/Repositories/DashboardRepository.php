<?php

namespace App\Repositories;

use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use Illuminate\Support\Facades\DB;

class DashboardRepository
{
    public function getInventoryTotalValue(int $pharmacyId): float
    {
        return (float) PharmacyProduct::where('pharmacy_id', $pharmacyId)
            ->sum(DB::raw('stock * selling_price'));
    }

    public function getTopCategory(int $pharmacyId, string $startDate): ?object
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('pharmacy_products', 'order_items.pharmacy_product_id', '=', 'pharmacy_products.id')
            ->join('categories', 'pharmacy_products.category_id', '=', 'categories.id')
            ->where('orders.pharmacy_id', $pharmacyId)
            ->where('orders.status', 'completed')
            ->where('orders.completed_at', '>=', $startDate)
            ->select('categories.category_name', DB::raw('SUM(order_items.line_total) as category_rev'))
            ->groupBy('categories.category_name')
            ->orderByDesc('category_rev')
            ->first();
    }

    public function getExpiringSoonBatches(int $pharmacyId, string $startDate, string $endDate, int $limit = 5)
    {
        return ProductBatch::with('pharmacyProduct.product')
            ->whereHas('pharmacyProduct', fn($q) => $q->where('pharmacy_id', $pharmacyId))
            ->whereNotNull('expiry_date')
            ->where('stock', '>', 0)
            ->where('expiry_date', '>', $startDate)
            ->where('expiry_date', '<=', $endDate)
            ->orderBy('expiry_date', 'asc')
            ->take($limit)
            ->get();
    }

    public function getFallbackLowStockProducts(int $pharmacyId, int $threshold = 50, int $limit = 5)
    {
        return PharmacyProduct::with('product')
            ->where('pharmacy_id', $pharmacyId)
            ->where('stock', '<=', $threshold)
            ->orderBy('stock', 'asc')
            ->take($limit)
            ->get();
    }
}
