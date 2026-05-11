<?php

namespace App\Services\BranchProduct;

use App\Models\BranchProduct;
use Illuminate\Contracts\Pagination\CursorPaginator;

class ShowBranchProductService
{
    private const DEFAULT_PER_PAGE = 20;

    /**
     * Return a cursor-paginated set of branch products.
     */
    public function handle(
        int $branchId,
        ?int $categoryId = null,
        int $perPage = self::DEFAULT_PER_PAGE,
        ?string $cursor = null,
    ): CursorPaginator {
        $query = BranchProduct::query()
            ->with([
                'product:id,product_type,product_name,generic_name,brand_name,description,form,strength,is_prescribed',
                'category:id,category_name,description',
            ])
            ->where('branch_id', $branchId)
            ->orderBy('id');

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        return $query->cursorPaginate(
            perPage: min($perPage, 50),
            cursor: $cursor,
        );
    }
}
