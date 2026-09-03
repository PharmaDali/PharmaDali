<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view any orders (sales reports / order list).
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_sales_reports') || $user->hasPermission('access_pos') || $user->hasPermission('access_pickup');
    }

    /**
     * Determine whether the user can view a specific order.
     */
    public function view(User $user, Order $order): bool
    {
        if (in_array($user->role, ['pharmacy_admin', 'super_admin'], true)) {
            return true;
        }

        if ($user->role === 'pharmacist') {
            if (!$user->hasPermission('view_sales_reports')) {
                return false;
            }
            // Pharmacist can view order if they processed it or verified it, or if it belongs to their pharmacy
            return (int) $order->processed_by_user_id === (int) $user->id
                || (int) $order->user_id === (int) $user->id
                || (int) $order->verifier_id === (int) $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can process an item exchange / return on an order.
     */
    public function processExchange(User $user, ?Order $order = null): bool
    {
        return $user->hasPermission('process_item_exchange');
    }
}
