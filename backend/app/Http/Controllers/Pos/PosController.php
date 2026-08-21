<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pos\CompletePickupOrderRequest;
use App\Http\Requests\Pos\StorePosOrderRequest;
use App\Models\Order;
use App\Services\Pos\PosService;
use App\Services\Receipt\ReceiptService;
use Illuminate\Http\Request;

class PosController extends Controller
{
    protected $posService;
    protected $receiptService;

    public function __construct(PosService $posService, ReceiptService $receiptService)
    {
        $this->posService     = $posService;
        $this->receiptService = $receiptService;
    }

    public function getProducts(Request $request)
    {
        $this->authorizePermission('access_pos', 'Unauthorized to access POS counter.');

        $products = $this->posService->getProducts($request->all());

        return $this->successResponse([
            'data' => $products->items(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'total' => $products->total(),
        ], 'POS products fetched successfully.');
    }

    public function storeOrder(StorePosOrderRequest $request)
    {
        $this->authorizePermission('access_pos', 'Unauthorized to process POS orders.');

        try {
            $order = $this->posService->createOrder($request->validated(), $request->user());

            return $this->successResponse($order, 'Order completed successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getPickupOrders(Request $request)
    {
        $this->authorizePermission('access_pickup', 'Unauthorized to view pickup orders.');

        try {
            $orders = $this->posService->getPickupOrders($request->all(), $request->user());
            return $this->successResponse($orders, 'Pickup orders retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function completePickupOrder(CompletePickupOrderRequest $request, Order $order)
    {
        $this->authorizePermission('access_pickup', 'Unauthorized to complete pickup orders.');

        try {
            $order = $this->posService->completePickupOrder(
                $order, 
                $request->payment_method, 
                $request->user(),
                $request->amount_received,
                $request->change_amount,
                $request->only(['discount_type', 'discount_percentage', 'discount_amount', 'discount_id_number', 'discount_remarks'])
            );

            return $this->successResponse($order, 'Pickup order completed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getReceipt(Request $request, Order $order)
    {
        $user = $request->user();

        // Ensure the order belongs to the authenticated user's pharmacy
        if ($order->pharmacy_id !== $user->pharmacy_id) {
            return $this->errorResponse('Unauthorized: This order does not belong to your pharmacy.', 403);
        }

        // Only allow printing receipts for completed orders
        if ($order->status !== 'completed') {
            return $this->errorResponse('A receipt can only be generated for completed orders.', 422);
        }

        try {
            // Eager-load all relations required by the ReceiptService
            $order->loadMissing([
                'pharmacy',
                'items',
                'verifier:id,first_name,last_name',
                'customer.user:id,first_name,last_name',
            ]);

            $receiptData = $this->receiptService->buildReceiptData($order);

            return $this->successResponse($receiptData, 'Receipt payload generated successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}


