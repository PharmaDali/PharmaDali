<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\Order;
use App\Models\User;
use App\Models\Pharmacy;
use App\Services\Pharmacy\PharmacyOperatingHoursChecker;
use App\Services\Order\Actions\CreateOrderFromCart;
use App\Services\Order\Actions\DispatchOrderNotifications;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class PlaceOrderService
{
    public function __construct(
        private readonly PharmacyOperatingHoursChecker $operatingHoursChecker,
        private readonly CreateOrderFromCart $createOrderAction,
        private readonly DispatchOrderNotifications $dispatchNotificationsAction,
    ) {}

    public function handle(?User $user, array $payload): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return $this->errorResponse('Only customers can place orders.', 403);
        }

        $customer = $user->customer;
        if (!$customer) {
            return $this->errorResponse('Customer profile not found.', 403);
        }

        $activeCart = $this->resolveActiveCart($customer->id, $user->id);
        if (!$activeCart) {
            return $this->errorResponse('No active cart found for checkout.', 422);
        }

        $pharmacy = Pharmacy::find($activeCart->pharmacy_id);
        $hoursReason = null;
        if (!$pharmacy || !$pharmacy->is_active || !$this->operatingHoursChecker->isOrderEligibleWithinHours($pharmacy, new Order(['created_at' => now()]), 1, $hoursReason)) {
            return $this->errorResponse('The pharmacy is currently closed. Orders cannot be placed at this time.', 422);
        }

        $selectedCartItemIds = $this->normalizeSelectedCartItemIds($payload);
        if ($selectedCartItemIds->isEmpty()) {
            return $this->errorResponse('No selected cart items found for checkout.', 422);
        }

        $cartItems = $this->resolveSelectedCartItems($activeCart, $selectedCartItemIds);
        if ($cartItems->isEmpty()) {
            return $this->errorResponse('Cannot place an order with an empty cart.', 422);
        }

        if ($cartItems->count() !== $selectedCartItemIds->count()) {
            return $this->errorResponse('Some selected cart items are invalid for this checkout.', 422);
        }

        $unavailableItems = $cartItems->filter(fn($item) => !$item->pharmacyProduct || !$item->pharmacyProduct->is_available || $item->pharmacyProduct->stock < $item->quantity);
        if ($unavailableItems->isNotEmpty()) {
            return $this->errorResponse('Some selected items are currently out of stock or unavailable for checkout. Please review your cart.', 422);
        }

        try {
            $order = $this->createOrderAction->execute(
                activeCart: $activeCart,
                cartItems: $cartItems,
                payload: $payload,
                customerId: (int) $customer->id,
                selectedCartItemIds: $selectedCartItemIds,
            );

            // Defer notification and system message dispatch to Laravel terminating phase
            $this->dispatchNotificationsAction->execute($user, $order, $pharmacy);

            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully.',
                'data' => $order,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Order placement failed: ' . $e->getMessage(), ['exception' => $e]);
            return $this->errorResponse('An error occurred while placing your order. Your cart has not been modified. Please try again later.', 500);
        }
    }

    private function resolveActiveCart(int $customerId, int $userId): ?Cart
    {
        return Cart::query()
            ->where('status', 'active')
            ->where(function ($query) use ($customerId, $userId) {
                $query->where('customer_id', $customerId)
                    ->orWhere('customer_id', $userId);
            })
            ->latest('id')
            ->first();
    }

    private function normalizeSelectedCartItemIds(array $payload): Collection
    {
        return collect($payload['cart_item_ids'] ?? [])
            ->map(fn($id) => (int) $id)
            ->filter(fn($id) => $id > 0)
            ->unique()
            ->values();
    }

    private function resolveSelectedCartItems(Cart $activeCart, Collection $selectedCartItemIds): Collection
    {
        return $activeCart->items()
            ->whereIn('id', $selectedCartItemIds)
            ->with(['pharmacyProduct.product:id,product_name'])
            ->get();
    }

    private function errorResponse(string $message, int $status): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $status);
    }
}
