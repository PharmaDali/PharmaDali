<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\CartItem;
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

        $selectedCartItemIds = $this->normalizeSelectedCartItemIds($payload);
        if ($selectedCartItemIds->isEmpty()) {
            return $this->errorResponse('No selected cart items found for checkout.', 422);
        }

        // Resolve the specific cart items selected by customer across any of their active carts
        $cartItems = $this->resolveSelectedCartItems((int) $customer->id, (int) $user->id, $selectedCartItemIds);
        if ($cartItems->isEmpty()) {
            return $this->errorResponse('Cannot place an order with an empty cart.', 422);
        }

        if ($cartItems->count() !== $selectedCartItemIds->count()) {
            return $this->errorResponse('Some selected cart items are invalid for this checkout.', 422);
        }

        // Validate that all selected items belong to the same pharmacy
        $pharmacyIds = $cartItems->map(fn($item) => $item->cart?->pharmacy_id)->filter()->unique();
        if ($pharmacyIds->count() > 1) {
            return $this->errorResponse('Selected items belong to multiple pharmacies. Please checkout items from one pharmacy at a time.', 422);
        }

        // Resolve the active cart and pharmacy from the items directly
        /** @var Cart $activeCart */
        $activeCart = $cartItems->first()->cart;
        if (!$activeCart) {
            return $this->errorResponse('No active cart found for checkout.', 422);
        }

        $pharmacy = $activeCart->pharmacy ?? Pharmacy::find($activeCart->pharmacy_id);
        if (!$pharmacy) {
            return $this->errorResponse('Pharmacy not found for this order.', 422);
        }

        $hoursReason = null;
        $scheduledPickupAt = $payload['scheduled_pickup_at'] ?? null;
        if (!$this->operatingHoursChecker->isScheduledPickupEligible($pharmacy, $scheduledPickupAt, $hoursReason)) {
            return $this->errorResponse($hoursReason ?: 'The selected pickup schedule is invalid or outside store operating hours.', 422);
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

    private function normalizeSelectedCartItemIds(array $payload): Collection
    {
        return collect($payload['cart_item_ids'] ?? [])
            ->map(fn($id) => (int) $id)
            ->filter(fn($id) => $id > 0)
            ->unique()
            ->values();
    }

    private function resolveSelectedCartItems(int $customerId, int $userId, Collection $selectedCartItemIds): Collection
    {
        return CartItem::query()
            ->whereIn('id', $selectedCartItemIds)
            ->whereHas('cart', function ($query) use ($customerId, $userId) {
                $query->withoutGlobalScopes()
                    ->where('status', 'active')
                    ->where(function ($q) use ($customerId, $userId) {
                        $q->where('customer_id', $customerId)
                            ->orWhere('customer_id', $userId);
                    });
            })
            ->with([
                'cart' => fn($q) => $q->withoutGlobalScopes(),
                'cart.pharmacy',
                'pharmacyProduct.product:id,product_name',
            ])
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
