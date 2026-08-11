<?php

namespace App\Http\Controllers\Api\Pos;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreItemExchangeRequest;
use App\Models\Order;
use App\Services\Pos\ItemExchange\ItemExchangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ItemExchangeController extends Controller
{
    public function __construct(
        private readonly ItemExchangeService $exchangeService
    ) {}

    /**
     * Display a listing of item exchanges for the current pharmacy.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $exchanges = $this->exchangeService->getHistory($request->all(), $user);

            return response()->json([
                'success' => true,
                'data' => $exchanges,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Check order exchange eligibility and return limits.
     */
    public function eligibility(Request $request, Order $order): JsonResponse
    {
        try {
            $user = $request->user();
            $userPharmacyId = $user->pharmacy_id ?? $user->pharmacy?->id ?? $order->pharmacy_id;

            if ($order->pharmacy_id && $userPharmacyId && (int) $order->pharmacy_id !== (int) $userPharmacyId) {
                if (!in_array($user->role, ['admin', 'super_admin', 'system_admin'], true)) {
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'eligible' => false,
                            'reason' => 'Order does not belong to your assigned pharmacy branch.',
                            'items' => [],
                        ],
                    ]);
                }
            }

            $eligibility = $this->exchangeService->getEligibility($order, $user);

            return response()->json([
                'success' => true,
                'data' => $eligibility,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Store a new item exchange transaction.
     */
    public function store(StoreItemExchangeRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            $exchange = $this->exchangeService->process($request->validated(), $user);

            return response()->json([
                'success' => true,
                'message' => 'Item exchange completed successfully.',
                'data' => $exchange,
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified item exchange.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $exchange = $this->exchangeService->getDetails($id, $user);

            return response()->json([
                'success' => true,
                'data' => $exchange,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 404);
        }
    }
}
