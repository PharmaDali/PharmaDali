<?php

namespace App\Repositories;

use App\Models\ItemExchange;
use Illuminate\Pagination\LengthAwarePaginator;

class ItemExchangeRepository
{
    /**
     * Find an exchange by ID with relations, ensuring it matches the pharmacy ID.
     */
    public function findWithRelations(int $exchangeId, int $pharmacyId): ItemExchange
    {
        $exchange = ItemExchange::with([
            'order.customer.user',
            'processedBy',
            'pharmacy',
            'returnedItems.pharmacyProduct.product',
            'returnedItems.orderItem',
            'replacementItems.pharmacyProduct.product',
        ])->findOrFail($exchangeId);

        if ((int) $exchange->pharmacy_id !== (int) $pharmacyId) {
            throw new \Exception("Unauthorized access to exchange record.");
        }

        return $exchange;
    }

    /**
     * Get paginated exchange history for a pharmacy.
     */
    public function getPaginatedHistory(int $pharmacyId, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = ItemExchange::with([
            'order',
            'processedBy',
            'returnedItems.pharmacyProduct.product',
            'replacementItems.pharmacyProduct.product',
        ])->where('pharmacy_id', $pharmacyId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('exchange_number', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        return $query->latest()->paginate($perPage);
    }
}
