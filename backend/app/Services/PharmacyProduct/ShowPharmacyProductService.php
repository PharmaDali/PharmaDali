<?php

namespace App\Services\PharmacyProduct;

use App\Models\PharmacyProduct;
use Illuminate\Contracts\Pagination\CursorPaginator;

class ShowPharmacyProductService
{
    private const DEFAULT_PER_PAGE = 30;

    /**
     * Return a cursor-paginated set of pharmacy products.
     * Supports category, price, brand, availability, prescription filters, and custom sorting.
     */
    public function handle(
        int $pharmacyId,
        ?int $categoryId = null,
        int $perPage = self::DEFAULT_PER_PAGE,
        ?string $cursor = null,
        array $recommendedProductIds = [],
        array $filters = [],
        ?string $sort = null
    ): CursorPaginator {
        $query = PharmacyProduct::query()
            ->with([
                'product:id,product_type,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed,image_path',
                'category:id,category_name,description,background_color,font_color,is_enabled',
            ])
            ->where('pharmacy_id', $pharmacyId);

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        // Price range filters
        if (isset($filters['price_min']) && $filters['price_min'] !== null && $filters['price_min'] !== '') {
            $query->where('selling_price', '>=', (float) $filters['price_min']);
        }
        if (isset($filters['price_max']) && $filters['price_max'] !== null && $filters['price_max'] !== '') {
            $query->where('selling_price', '<=', (float) $filters['price_max']);
        }

        // Brands filter
        if (!empty($filters['brands'])) {
            $brandList = is_array($filters['brands'])
                ? $filters['brands']
                : array_filter(array_map('trim', explode(',', $filters['brands'])));
            if (!empty($brandList)) {
                $query->whereHas('product', function ($q) use ($brandList) {
                    $q->whereIn('brand_name', $brandList);
                });
            }
        }

        // Availability filter
        if (!empty($filters['availability'])) {
            $avail = strtolower(trim($filters['availability']));
            if (str_contains($avail, 'in stock')) {
                $query->where('stock', '>', 0)->where('is_available', true);
            } elseif (str_contains($avail, 'out of stock')) {
                $query->where(function ($q) {
                    $q->where('stock', '<=', 0)->orWhere('is_out_of_stock', true);
                });
            } elseif (str_contains($avail, 'low stock')) {
                $query->where('stock', '>', 0)->where('stock', '<=', 50);
            }
        }

        // Prescription Type filter
        if (!empty($filters['prescription_type'])) {
            $rx = strtolower(trim($filters['prescription_type']));
            if (str_contains($rx, 'prescription required') || $rx === 'prescription' || $rx === 'rx') {
                $query->whereHas('product', function ($q) {
                    $q->where('is_prescribed', true);
                });
            } elseif (str_contains($rx, 'counter') || $rx === 'otc' || str_contains($rx, 'over-the-counter')) {
                $query->whereHas('product', function ($q) {
                    $q->where('is_prescribed', false);
                });
            }
        }

        // Sorting
        $normalizedSort = strtolower(str_replace([' ', '-', '_'], '', $sort ?? ''));
        switch ($normalizedSort) {
            case 'pricelowtohigh':
            case 'priceasc':
                $query->orderBy('selling_price', 'asc')->orderBy('id', 'asc');
                break;
            case 'pricehightolow':
            case 'pricedesc':
                $query->orderBy('selling_price', 'desc')->orderBy('id', 'asc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc')->orderBy('id', 'desc');
                break;
            case 'bestselling':
            case 'mostpopular':
            case 'popular':
                $query->withCount('orderItems')
                      ->orderByDesc('order_items_count')
                      ->orderBy('id', 'asc');
                break;
            default:
                if (!empty($recommendedProductIds)) {
                    $validIds = array_map('intval', $recommendedProductIds);
                    $idsString = implode(',', $validIds);
                    $query->orderByRaw("CASE WHEN id IN ({$idsString}) THEN 0 ELSE 1 END")
                          ->orderByRaw("FIELD(id, {$idsString})");
                }
                $query->orderBy('id', 'asc');
                break;
        }

        return $query->cursorPaginate(
            perPage: min($perPage, 100),
            cursor: $cursor,
        );
    }
}
