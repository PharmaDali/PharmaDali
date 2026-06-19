<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Pharmacy;
use App\Services\Messaging\ConversationService;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\NewOrderPharmacistNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class PlaceOrderService
{
    public function __construct(
        private readonly ConversationService $conversationService,
    ) {
    }

    public function handle(?User $user, array $payload): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can place orders.',
            ], 403);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        $activeCart = $this->resolveActiveCart($customer->id, $user->id);

        if (!$activeCart) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active cart found for checkout.',
            ], 422);
        }

        $pharmacy = Pharmacy::find($activeCart->pharmacy_id);

        if (!$pharmacy || !$this->isPharmacyOpen($pharmacy)) {
            return response()->json([
                'status' => 'error',
                'message' => 'The pharmacy is currently closed. Orders cannot be placed at this time.',
            ], 422);
        }

        $selectedCartItemIds = $this->normalizeSelectedCartItemIds($payload);

        if ($selectedCartItemIds->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No selected cart items found for checkout.',
            ], 422);
        }

        $cartItems = $this->resolveSelectedCartItems($activeCart, $selectedCartItemIds);

        if ($cartItems->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot place an order with an empty cart.',
            ], 422);
        }

        if ($cartItems->count() !== $selectedCartItemIds->count()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Some selected cart items are invalid for this checkout.',
            ], 422);
        }

        try {
            $order = DB::transaction(function () use ($activeCart, $cartItems, $payload, $customer, $selectedCartItemIds, $user, $pharmacy) {
                $order = $this->createOrderFromCart(
                    activeCart: $activeCart,
                    cartItems: $cartItems,
                    payload: $payload,
                    customerId: (int) $customer->id,
                    selectedCartItemIds: $selectedCartItemIds,
                );

                // Send Notification to Customer
                $user->notify(new OrderPlacedNotification($order));

                // Send Notification to Pharmacists in the pharmacy
                $pharmacists = $pharmacy->pharmacists;
                Notification::send($pharmacists, new NewOrderPharmacistNotification($order));

                $this->conversationService->appendSystemMessage($order, 'Order received', [
                    'status' => $order->status,
                    'order_number' => $order->order_number,
                ]);

                return $order;
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Order placed successfully.',
                'data' => $order,
            ], 201);
        } catch (\Throwable $e) {
            Log::error('Order placement failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while placing your order. Your cart has not been modified. Please try again later.',
            ], 500);
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

    private function createOrderFromCart(
        Cart $activeCart,
        Collection $cartItems,
        array $payload,
        int $customerId,
        Collection $selectedCartItemIds,
    ): Order {
        $timestamp = now();

        $order = Order::query()->create([
            'order_number' => $this->generateOrderNumber(),
            'customer_id' => $customerId,
            'pharmacy_id' => $activeCart->pharmacy_id,
            'status' => 'pending',
            'payment_method' => $payload['payment_method'],
            'payment_status' => 'unpaid',
            'subtotal' => 0,
            'discount_amount' => 0,
            'total_amount' => 0,
            'scheduled_pickup_at' => $payload['scheduled_pickup_at'] ?? null,
            'picked_up_at' => $payload['picked_up_at'] ?? null,
            'note' => $payload['note'] ?? null,
            'placed_at' => $timestamp,
        ]);

        [$orderItemRows, $subtotal] = $this->buildOrderItemRows($order->id, $cartItems, $timestamp);

        if (!empty($orderItemRows)) {
            OrderItem::query()->insert($orderItemRows);
        }

        $order->update([
            'subtotal' => $subtotal,
            'total_amount' => $subtotal,
        ]);

        $this->cleanupCartAfterOrder($activeCart, $selectedCartItemIds);

        return $order->load([
            'customer:id,user_id',
            'customer.user:id,first_name,last_name,email',
            'pharmacy:id,pharmacy_name,location',
            'items:id,order_id,pharmacy_product_id,quantity,unit_price_snapshot,line_total,product_name',
        ]);
    }

    private function buildOrderItemRows(int $orderId, Collection $cartItems, $timestamp): array
    {
        $subtotal = 0;
        $orderItemRows = [];

        foreach ($cartItems as $cartItem) {
            $quantity = (int) $cartItem->quantity;
            $unitPrice = (float) $cartItem->price_snapshot;
            $lineTotal = round($quantity * $unitPrice, 2);
            $subtotal += $lineTotal;

            $productName = $cartItem->pharmacyProduct?->product?->product_name ?? 'Unknown Product';

            $orderItemRows[] = [
                'order_id' => $orderId,
                'pharmacy_product_id' => $cartItem->pharmacy_product_id,
                'quantity' => $quantity,
                'unit_price_snapshot' => $unitPrice,
                'line_total' => $lineTotal,
                'product_name' => $productName,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }

        return [$orderItemRows, $subtotal];
    }

    private function cleanupCartAfterOrder(Cart $activeCart, Collection $selectedCartItemIds): void
    {
        $activeCart->items()
            ->whereIn('id', $selectedCartItemIds)
            ->delete();

        if (!$activeCart->items()->exists()) {
            $activeCart->update([
                'status' => 'completed',
            ]);
        }
    }

    private function isPharmacyOpen(Pharmacy $pharmacy): bool
    {
        if (!$pharmacy->is_active) {
            return false;
        }

        if (!$pharmacy->opening_hour || !$pharmacy->closing_hour) {
            return false;
        }

        $now = now();
        $currentMinutes = ($now->hour * 60) + $now->minute;

        $openingMinutes = $this->timeToMinutes($pharmacy->opening_hour);
        $closingMinutes = $this->timeToMinutes($pharmacy->closing_hour);

        if ($openingMinutes === $closingMinutes) {
            return false;
        }

        // Normal schedule (e.g., 09:00 - 21:00)
        if ($openingMinutes < $closingMinutes) {
            return $currentMinutes >= $openingMinutes && $currentMinutes < $closingMinutes;
        }

        // Overnight schedule (e.g., 20:00 - 06:00)
        return $currentMinutes >= $openingMinutes || $currentMinutes < $closingMinutes;
    }

    private function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = explode(':', $time);

        return ((int) $hours * 60) + (int) $minutes;
    }

    private function errorResponse(string $message, int $status): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
        ], $status);
    }

    private function generateOrderNumber(): string
    {
        return 'ORD-' . now()->format('YmdHis') . '-' . random_int(1000, 9999);
    }
}
