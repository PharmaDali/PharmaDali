<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Pos\PosService;
use Illuminate\Http\Request;

class PosController extends Controller
{
    protected $posService;

    public function __construct(PosService $posService)
    {
        $this->posService = $posService;
    }

    /**
     * Get products for POS with infinite scroll and search functionality.
     */
    public function getProducts(Request $request)
    {
        $products = $this->posService->getProducts($request->all());

        return response()->json([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'total' => $products->total(),
        ]);
    }

    /**
     * Store a new POS order.
     */
    public function storeOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:branch_products,id',
            'items.*.qty' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'amount_received' => 'nullable|numeric|min:0',
            'change_amount' => 'nullable|numeric|min:0',
            'note' => 'nullable|string',
        ]);

        try {
            $order = $this->posService->createOrder($request->all(), $request->user());

            return response()->json([
                'status' => 'success',
                'message' => 'Order completed successfully',
                'data' => $order
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get pickup orders for the branch with search and status filtering.
     */
    public function getPickupOrders(Request $request)
    {
        try {
            $orders = $this->posService->getPickupOrders($request->all(), $request->user());
            return response()->json([
                'status' => 'success',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Complete a pickup order.
     */
    public function completePickupOrder(Request $request, \App\Models\Order $order)
    {
        $request->validate([
            'payment_method' => 'required|string|in:cash,gcash,card,maya',
            'amount_received' => 'nullable|numeric|min:0',
            'change_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            $order = $this->posService->completePickupOrder(
                $order, 
                $request->payment_method, 
                $request->user(),
                $request->amount_received,
                $request->change_amount
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Pickup order completed successfully',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
