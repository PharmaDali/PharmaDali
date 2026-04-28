<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BranchProduct;
use App\Services\ProductImage\RenderProductSvgService;
use Illuminate\Http\Request;

class ProductImageController extends Controller
{
    public function showBranchProductImage(Request $request, int $branchId, int $productId, RenderProductSvgService $renderProductSvgService)
    {
        $branchProduct = BranchProduct::query()
            ->with(['product', 'category'])
            ->where('branch_id', $branchId)
            ->where('product_id', $productId)
            ->firstOrFail();

        $quantity = $request->input('quantity');
        $svg = $renderProductSvgService->render($branchProduct, is_string($quantity) ? $quantity : null);

        return response($svg, 200, ['Content-Type' => 'image/svg+xml']);
    }
}
