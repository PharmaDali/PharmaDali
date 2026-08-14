<?php

namespace App\Policies;

use App\Models\PharmacyProduct;
use App\Models\User;

class PharmacyProductPolicy
{
    /**
     * Determine whether the user can view any products/inventory.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('view_inventory') || $user->hasPermission('access_pos');
    }

    /**
     * Determine whether the user can create products / manage stock.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['pharmacy_admin', 'admin', 'super_admin', 'system_admin'], true);
    }

    /**
     * Determine whether the user can update products / adjust inventory stock.
     */
    public function update(User $user, ?PharmacyProduct $product = null): bool
    {
        return in_array($user->role, ['pharmacy_admin', 'admin', 'super_admin', 'system_admin'], true);
    }

    /**
     * Determine whether the user can delete products / remove stock.
     */
    public function delete(User $user, ?PharmacyProduct $product = null): bool
    {
        return in_array($user->role, ['pharmacy_admin', 'admin', 'super_admin', 'system_admin'], true);
    }
}
