<?php

namespace App\Repositories;

use App\Models\OrderItem;
use App\Models\PharmacyProduct;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RestockRepository
{
    /**
     * Fetch a flattened snapshot of all pharmacy products combined with
     * their 30-day sales totals. This is the single database concern for the
     * restock predictor — all further calculations are done in the algorithm layer.
     *
     * Returns an array of associative arrays with the keys:
     *   id, name, brand, category, quantity, selling_price, total_sold_30d
     *
     * @param  int $pharmacyId
     * @return array
     */
    public function getProductSalesSnapshot(int $pharmacyId): array
    {
        $thirtyDaysAgo = Carbon::today()->subDays(30);
        $sevenDaysAgo = Carbon::today()->subDays(7);

        // Query the sales totals grouped by pharmacy_product_id over a 30-day window
        $salesMap30d = OrderItem::query()
            ->select('pharmacy_product_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($query) use ($pharmacyId, $thirtyDaysAgo) {
                $query->where('pharmacy_id', $pharmacyId)
                      ->where('status', 'completed')
                      ->where(function ($q) use ($thirtyDaysAgo) {
                          $q->where('placed_at', '>=', $thirtyDaysAgo)
                            ->orWhere('created_at', '>=', $thirtyDaysAgo);
                      });
            })
            ->groupBy('pharmacy_product_id')
            ->pluck('total_sold', 'pharmacy_product_id')
            ->toArray();

        // Query the sales totals grouped by pharmacy_product_id over a 7-day window
        $salesMap7d = OrderItem::query()
            ->select('pharmacy_product_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($query) use ($pharmacyId, $sevenDaysAgo) {
                $query->where('pharmacy_id', $pharmacyId)
                      ->where('status', 'completed')
                      ->where(function ($q) use ($sevenDaysAgo) {
                          $q->where('placed_at', '>=', $sevenDaysAgo)
                            ->orWhere('created_at', '>=', $sevenDaysAgo);
                      });
            })
            ->groupBy('pharmacy_product_id')
            ->pluck('total_sold', 'pharmacy_product_id')
            ->toArray();

        // Fetch all products for this pharmacy
        $products = PharmacyProduct::with(['product:id,product_name,brand_name', 'category:id,category_name', 'batches'])
            ->where('pharmacy_id', $pharmacyId)
            ->get();

        return $products->map(function ($bp) use ($salesMap30d, $salesMap7d) {
            return [
                'id'             => $bp->id,
                'name'           => $bp->product->product_name ?? 'Unknown',
                'brand'          => $bp->product->brand_name ?? 'Generic',
                'category'       => $bp->category->category_name ?? 'Uncategorized',
                'quantity'       => (int) $bp->stock,
                'selling_price'  => (float) $bp->selling_price,
                'lead_time_days' => $bp->lead_time_days,
                'ordered_at'     => $bp->ordered_at,
                'total_sold_30d' => (int) ($salesMap30d[$bp->id] ?? 0),
                'total_sold_7d'  => (int) ($salesMap7d[$bp->id] ?? 0),
                'batches'        => $bp->batches->map(fn($b) => ['batch_number' => $b->batch_number])->toArray(),
            ];
        })->toArray();
    }
}
