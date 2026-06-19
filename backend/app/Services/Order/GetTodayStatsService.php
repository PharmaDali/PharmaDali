<?php

namespace App\Services\Order;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class GetTodayStatsService
{
    public function handle(): array
    {
        $user = Auth::user();
        $query = Order::whereDate('created_at', today())
            ->where('payment_status', 'paid');

        // For pharmacy admins/pharmacists, scope to their pharmacy
        if ($user && $user->pharmacy_id) {
            $query->where('pharmacy_id', $user->pharmacy_id);
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
