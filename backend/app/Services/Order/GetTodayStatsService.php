<?php

namespace App\Services\Order;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class GetTodayStatsService
{
    public function handle(): array
    {
        $user = Auth::user();
        $query = Order::whereDate('created_at', today());

        // For branch admins/pharmacists, scope to their branch
        if ($user && $user->branch_id) {
            $query->where('branch_id', $user->branch_id);
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
