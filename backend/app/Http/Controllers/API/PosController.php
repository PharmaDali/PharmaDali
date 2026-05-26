<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BranchProduct;
use Illuminate\Http\Request;

class PosController extends Controller
{
    /**
     * Get products for POS with infinite scroll and search functionality.
     */
    public function getProducts(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 20);

        $query = BranchProduct::with(['product', 'category'])
            ->where('is_available', true);

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('brand_name', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate($perPage);

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'total' => $products->total(),
        ]);
    }
}
