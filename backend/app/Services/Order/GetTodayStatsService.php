<?php

namespace App\Services\Order;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class GetTodayStatsService
{
    public function handle(?int $pharmacyId = null): array
    {
        $user = Auth::user();
        $targetPharmacyId = $pharmacyId ?? $user?->pharmacy_id;

        $query = Order::where(function ($q) {
                $q->whereDate('completed_at', today())
                  ->orWhere(function ($sub) {
                      $sub->whereNull('completed_at')
                          ->whereDate('created_at', today());
                  });
            })
            ->where('payment_status', 'paid');

        if ($targetPharmacyId) {
            $query->where('pharmacy_id', $targetPharmacyId);
        }

        $totalOrders = (clone $query)->count();
        
        // Sales are typically orders that are completed or picked up
        $totalSales = (clone $query)
            ->whereIn('status', ['completed', 'picked_up'])
            ->sum('total_amount');

        return [
            'total_orders' => $totalOrders,
            'total_sales' => (float) $totalSales,
        ];
    }
}
