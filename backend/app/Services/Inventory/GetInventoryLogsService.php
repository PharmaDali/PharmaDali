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
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(product_name) LIKE ?', [$search])
                  ->orWhereHas('pharmacyProduct.product', function ($pq) use ($search) {
                      $pq->whereRaw('LOWER(product_name) LIKE ?', [$search]);
                  });
            });
        }

        // Filter by transaction type (action)
        if (!empty($filters['action']) && strtolower($filters['action']) !== 'all') {
            $typeMap = [
                'stock in'        => 'stock_in',
                'stock out'       => 'stock_out',
                'adjustment'      => 'adjustment',
                'waste'           => 'waste',
                'product deleted' => 'product_deleted',
                'deleted'         => 'product_deleted',
            ];
            $mapped = $typeMap[strtolower($filters['action'])] ?? strtolower($filters['action']);
            $query->where('transaction_type', $mapped);
        }

        // Filter by date
        if (!empty($filters['date_range'])) {
            $query->whereDate('created_at', $filters['date_range']);
        }

        return $query->latest()->get()->map(function ($log) {
            $productName = $log->product_name;
            if (!$productName && $log->pharmacyProduct?->product) {
                $p = $log->pharmacyProduct->product;
                $nameParts = array_filter([
                    $p->product_name,
                    ($p->strength && !in_array(strtolower(trim($p->strength)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($p->strength) : null,
                    ($p->size && !in_array(strtolower(trim($p->size)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($p->size) : null,
                ]);
                $productName = implode(' ', $nameParts) ?: $p->product_name;
            }

            $action = is_object($log->transaction_type)
                ? (method_exists($log->transaction_type, 'label') ? $log->transaction_type->label() : ($log->transaction_type->value ?? $log->transaction_type->name))
                : ucwords(str_replace('_', ' ', (string) $log->transaction_type));

            return [
                'id'           => 'LOG-' . str_pad($log->id, 5, '0', STR_PAD_LEFT),
                'productName'  => $productName ?: 'Unknown Product',
                'batchNumber'  => $log->batch?->batch_number,
                'expiryDate'   => $log->batch?->expiry_date?->toDateString(),
                'action'       => $action,
                'quantity'     => $log->quantity,
                'dateTime'     => $log->created_at->format('Y-m-d H:i'),
                'user'         => $log->user
                    ? ($log->user->first_name . ' ' . $log->user->last_name)
                    : 'System',
                'reason'       => $log->reason,
                'sellingPrice' => $log->selling_price !== null 
                    ? (float) $log->selling_price 
                    : ($log->pharmacyProduct?->selling_price ? (float) $log->pharmacyProduct->selling_price : null),
                'unitCost'     => $log->unit_cost !== null 
                    ? (float) $log->unit_cost 
                    : ($log->pharmacyProduct?->unit_cost ? (float) $log->pharmacyProduct->unit_cost : null),
                'barcode'      => null,
            ];
        });
    }
}
