<?php

namespace App\Services\Inventory;

use App\Models\InventoryLog;
use Illuminate\Support\Collection;

class GetInventoryLogsService
{
    public function handle(array $filters = []): Collection
    {
        $query = InventoryLog::with(['pharmacyProduct.product', 'batch', 'user']);

        // Filter by product name search
        if (!empty($filters['search'])) {
            $search = '%' . strtolower($filters['search']) . '%';
            $query->whereHas('pharmacyProduct.product', function ($q) use ($search) {
                $q->whereRaw('LOWER(product_name) LIKE ?', [$search]);
            });
        }

        // Filter by transaction type (action)
        if (!empty($filters['action']) && strtolower($filters['action']) !== 'all') {
            $typeMap = [
                'stock in'   => 'stock_in',
                'stock out'  => 'stock_out',
                'adjustment' => 'adjustment',
                'waste'      => 'waste',
            ];
            $mapped = $typeMap[strtolower($filters['action'])] ?? strtolower($filters['action']);
            $query->where('transaction_type', $mapped);
        }

        // Filter by date
        if (!empty($filters['date_range'])) {
            $query->whereDate('created_at', $filters['date_range']);
        }

        return $query->latest()->get()->map(function ($log) {
            return [
                'id'           => 'LOG-' . str_pad($log->id, 5, '0', STR_PAD_LEFT),
                'productName'  => $log->pharmacyProduct->product->product_name ?? 'Unknown Product',
                'batchNumber'  => $log->batch?->batch_number,
                'expiryDate'   => $log->batch?->expiry_date?->toDateString(),
                'action'       => ucwords(str_replace('_', ' ', $log->transaction_type)),
                'quantity'     => $log->quantity,
                'dateTime'     => $log->created_at->format('Y-m-d H:i'),
                'user'         => $log->user
                    ? ($log->user->first_name . ' ' . $log->user->last_name)
                    : 'System',
                'reason'       => $log->reason,
                'sellingPrice' => $log->pharmacyProduct?->selling_price ? (float) $log->pharmacyProduct->selling_price : null,
                'unitCost'     => null,
                'barcode'      => null,
            ];
        });
    }
}
