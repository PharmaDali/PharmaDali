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
        $ninetyDaysAgo = Carbon::today()->subDays(90);

        // Query the sales totals grouped by pharmacy_product_id over a 90-day window
        $salesMap = OrderItem::query()
            ->select('pharmacy_product_id', DB::raw('SUM(quantity) as total_sold'))
            ->whereHas('order', function ($query) use ($pharmacyId, $ninetyDaysAgo) {
                $query->where('pharmacy_id', $pharmacyId)
                      ->where('status', 'completed')
                      ->where(function ($q) use ($ninetyDaysAgo) {
                          $q->where('placed_at', '>=', $ninetyDaysAgo)
                            ->orWhere('created_at', '>=', $ninetyDaysAgo);
                      });
            })
            ->groupBy('pharmacy_product_id')
            ->pluck('total_sold', 'pharmacy_product_id')
            ->toArray();

        // Fetch all products for this pharmacy
        $products = PharmacyProduct::with(['product:id,product_name,brand_name', 'category:id,category_name'])
            ->where('pharmacy_id', $pharmacyId)
            ->get();

        return $products->map(function ($bp) use ($salesMap) {
            return [
                'id'             => $bp->id,
                'name'           => $bp->product->product_name ?? 'Unknown',
                'brand'          => $bp->product->brand_name ?? 'Generic',
                'category'       => $bp->category->category_name ?? 'Uncategorized',
                'quantity'       => (int) $bp->stock,
                'selling_price'  => (float) $bp->selling_price,
                'total_sold_30d' => (int) ($salesMap[$bp->id] ?? 0),
            ];
        })->toArray();
    }
}
