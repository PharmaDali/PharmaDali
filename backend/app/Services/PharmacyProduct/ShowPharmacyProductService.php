<?php

namespace App\Services\PharmacyProduct;

use App\Models\PharmacyProduct;
use Illuminate\Contracts\Pagination\CursorPaginator;

class ShowPharmacyProductService
{
    private const DEFAULT_PER_PAGE = 30;

    /**
     * Return a cursor-paginated set of pharmacy products.
     * Optionally orders Apriori-recommended products first.
     */
    public function handle(
        int $pharmacyId,
        ?int $categoryId = null,
        int $perPage = self::DEFAULT_PER_PAGE,
        ?string $cursor = null,
        array $recommendedProductIds = []
    ): CursorPaginator {
        $query = PharmacyProduct::query()
            ->with([
                'product:id,product_type,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed',
                'category:id,category_name,description',
            ])
            ->where('pharmacy_id', $pharmacyId);

        if (!empty($recommendedProductIds)) {
            $validIds = array_map('intval', $recommendedProductIds);
            $idsString = implode(',', $validIds);
            $query->orderByRaw("CASE WHEN id IN ({$idsString}) THEN 0 ELSE 1 END")
                  ->orderByRaw("FIELD(id, {$idsString})");
        }

        $query->orderBy('id');

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        return $query->cursorPaginate(
            perPage: min($perPage, 100),
            cursor: $cursor,
        );
    }
}
