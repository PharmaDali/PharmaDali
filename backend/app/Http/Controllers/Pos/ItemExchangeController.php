<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pos\StoreItemExchangeRequest;
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
            if (!$user->hasPermission('process_item_exchange') && !$user->hasPermission('view_sales_reports')) {
                return $this->errorResponse('Unauthorized to view item exchange records.', 403);
            }

            $exchanges = $this->exchangeService->getHistory($request->all(), $user);

            return $this->successResponse($exchanges, 'Item exchanges retrieved successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Check order exchange eligibility and return limits.
     */
    public function eligibility(Request $request, Order $order): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user->hasPermission('process_item_exchange')) {
                return $this->successResponse([
                    'eligible' => false,
                    'reason' => 'You do not have permission to process item exchanges or returns.',
                    'items' => [],
                ], 'Item exchange permission restricted.');
            }

            $userPharmacyId = $user->pharmacy_id ?? $user->pharmacy?->id ?? $order->pharmacy_id;

            if ($order->pharmacy_id && $userPharmacyId && (int) $order->pharmacy_id !== (int) $userPharmacyId) {
                if ($user->role !== 'super_admin') {
                    return $this->successResponse([
                        'eligible' => false,
                        'reason' => 'Order does not belong to your assigned pharmacy branch.',
                        'items' => [],
                    ], 'Pharmacy branch mismatch.');
                }
            }

            $eligibility = $this->exchangeService->getEligibility($order, $user);

            return $this->successResponse($eligibility, 'Eligibility retrieved successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Store a new item exchange transaction.
     */
    public function store(StoreItemExchangeRequest $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user->hasPermission('process_item_exchange')) {
                return $this->errorResponse('You do not have permission to process item exchanges or returns.', 403);
            }

            $exchange = $this->exchangeService->process($request->validated(), $user);

            return $this->successResponse($exchange, 'Item exchange completed successfully.', 201);
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Display the specified item exchange.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user->hasPermission('process_item_exchange') && !$user->hasPermission('view_sales_reports')) {
                return $this->errorResponse('Unauthorized to view item exchange details.', 403);
            }

            $exchange = $this->exchangeService->getDetails($id, $user);

            return $this->successResponse($exchange, 'Item exchange details retrieved successfully.');
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }
}

