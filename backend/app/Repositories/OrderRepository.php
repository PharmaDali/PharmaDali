<?php

namespace App\Repositories;

use App\Models\ItemExchange;
use App\Models\Order;
use Carbon\Carbon;

class OrderRepository
{
    /**
     * Get aggregated sales summary for a given pharmacy.
     */
    public function getSalesSummary(int $pharmacyId, $user = null): array
    {
        $now = Carbon::now();

        $baseQuery = function () use ($pharmacyId, $user) {
            $q = Order::where('pharmacy_id', $pharmacyId)->where('status', 'completed');
            if ($user && $user->role === 'pharmacist') {
                $q->where('verified_by', $user->id);
            }
            return $q;
        };

        $exchangeQuery = function () use ($pharmacyId, $user) {
            $q = ItemExchange::where('pharmacy_id', $pharmacyId);
            if ($user && $user->role === 'pharmacist') {
                $q->where('processed_by', $user->id);
            }
            return $q;
        };

        $dailyOrdersSales = (float) $baseQuery()
            ->whereDate('completed_at', $now->toDateString())
            ->sum('total_amount');
        $dailyExchangeSales = (float) $exchangeQuery()
            ->whereDate('created_at', $now->toDateString())
            ->sum('additional_payment');

        $weeklyOrdersSales = (float) $baseQuery()
            ->whereBetween('completed_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])
            ->sum('total_amount');
        $weeklyExchangeSales = (float) $exchangeQuery()
            ->whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])
            ->sum('additional_payment');

        $monthlyOrdersSales = (float) $baseQuery()
            ->whereBetween('completed_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->sum('total_amount');
        $monthlyExchangeSales = (float) $exchangeQuery()
            ->whereBetween('created_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->sum('additional_payment');

        $totalTransactions = $baseQuery()->count();

        return [
            'daily_sales' => round($dailyOrdersSales + $dailyExchangeSales, 2),
            'weekly_sales' => round($weeklyOrdersSales + $weeklyExchangeSales, 2),
            'monthly_sales' => round($monthlyOrdersSales + $monthlyExchangeSales, 2),
            'total_transactions' => $totalTransactions,
        ];
    }

    /**
     * Get a paginated list of completed orders for the sales report.
     */
    public function getSalesList(int $pharmacyId, ?string $startDate, ?string $endDate, int $perPage = 15, $user = null)
    {
        $query = Order::with(['items', 'verifier', 'exchanges.returnedItems.pharmacyProduct.product', 'exchanges.replacementItems.pharmacyProduct.product'])
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed');

        if ($user && $user->role === 'pharmacist') {
            $query->where('verified_by', $user->id);
        }

        if ($startDate) {
            $query->where('completed_at', '>=', Carbon::parse($startDate)->startOfDay());
        }

        if ($endDate) {
            $query->where('completed_at', '<=', Carbon::parse($endDate)->endOfDay());
        }

        return $query->orderBy('completed_at', 'desc')->paginate($perPage);
    }

    /**
     * Get all completed orders for the sales report export.
     */
    public function getSalesListAll(int $pharmacyId, ?string $startDate, ?string $endDate, $user = null)
    {
        $query = Order::with(['items', 'verifier', 'exchanges.returnedItems.pharmacyProduct.product', 'exchanges.replacementItems.pharmacyProduct.product'])
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed');

        if ($user && $user->role === 'pharmacist') {
            $query->where('verified_by', $user->id);
        }

        if ($startDate) {
            $query->where('completed_at', '>=', Carbon::parse($startDate)->startOfDay());
        }

        if ($endDate) {
            $query->where('completed_at', '<=', Carbon::parse($endDate)->endOfDay());
        }

        return $query->orderBy('completed_at', 'desc')->get();
    }
}
