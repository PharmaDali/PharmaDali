<?php

namespace App\Observers;

use App\Models\PharmacyProduct;
use App\Notifications\AdminAlertNotification;

class PharmacyProductObserver
{
    /**
     * Handle the PharmacyProduct "updated" event.
     */
    public function updated(PharmacyProduct $pharmacyProduct): void
    {
        if ($pharmacyProduct->wasChanged('stock') && $pharmacyProduct->stock <= 50) {
            $product = $pharmacyProduct->product;
            $pharmacy = $pharmacyProduct->pharmacy;

            if ($product && $pharmacy) {
                $admins = $pharmacy->admins;
                $message = "Only {$pharmacyProduct->stock} units of {$product->product_name} remaining. This is below your set threshold.";

                foreach ($admins as $admin) {
                    // Avoid duplicates if there's already an unread Low Stock warning
                    $exists = $admin->unreadNotifications()
                        ->where('data->type', 'Low Stocks')
                        ->where('data->product_id', $pharmacyProduct->product_id)
                        ->exists();

                    if (!$exists) {
                        $admin->notify(new AdminAlertNotification('Low Stocks', $message, [
                            'product_id' => $pharmacyProduct->product_id,
                            'product_name' => $product->product_name,
                            'current_stock' => $pharmacyProduct->stock,
                        ]));
                    }
                }
            }
        }
    }
}
