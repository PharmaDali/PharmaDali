<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsRepository
{
    /**
     * Get sales timeseries grouped by the specified timeframe.
     * timeframe: 'daily', 'weekly', 'monthly', 'yearly'
     */
    public function getSalesTimeseries(int $pharmacyId, string $timeframe, string $startDate, string $endDate): array
    {
        $query = Order::query()
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);

        // Group by expression based on timeframe
        $groupBy = match ($timeframe) {
            'daily' => "DATE(completed_at)",
            'weekly' => "YEARWEEK(completed_at, 1)", // 1 = Monday starts the week
            'monthly' => "DATE_FORMAT(completed_at, '%Y-%m')",
            'yearly' => "YEAR(completed_at)",
            default => "DATE(completed_at)",
        };

        return $query->select(
            DB::raw("{$groupBy} as period"),
            DB::raw('SUM(total_amount) as revenue'),
            DB::raw('COUNT(id) as orders_count')
        )
        ->groupBy('period')
        ->orderBy('period', 'asc')
        ->get()
        ->toArray();
    }

    /**
     * Get demand (top products by quantity sold) within a timeframe.
     */
    public function getDemand(int $pharmacyId, string $startDate, string $endDate, int $limit = 10): array
    {
        return DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.pharmacy_id', $pharmacyId)
            ->where('orders.status', 'completed')
            ->whereBetween('orders.completed_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->select(
                'order_items.pharmacy_product_id',
                'order_items.product_name',
                DB::raw('SUM(order_items.quantity) as total_quantity_sold'),
                DB::raw('SUM(order_items.line_total) as total_revenue')
            )
            ->groupBy('order_items.pharmacy_product_id', 'order_items.product_name')
            ->orderByDesc('total_quantity_sold')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Retrieve all completed order items grouped by order_id to form "baskets" for the Apriori algorithm.
     */
    public function getBasketsForApriori(int $pharmacyId, string $startDate): array
    {
        $orderItems = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.pharmacy_id', $pharmacyId)
            ->where('orders.status', 'completed')
            ->where('orders.completed_at', '>=', Carbon::parse($startDate)->startOfDay())
            ->select('order_items.order_id', 'order_items.pharmacy_product_id', 'order_items.product_name')
            ->get();

        $baskets = [];
        $productNames = [];

        foreach ($orderItems as $item) {
            $baskets[$item->order_id][] = $item->pharmacy_product_id;
            // Store product names to map back later
            $productNames[$item->pharmacy_product_id] = $item->product_name;
        }

        return [
            'baskets' => array_values($baskets), // We only need the arrays of items, not the order IDs
            'product_names' => $productNames
        ];
    }
}
