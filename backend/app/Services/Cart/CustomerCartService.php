<?php

namespace App\Services\Cart;

use App\Models\PharmacyProduct;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerCartService
{
    public function countCartItems(?User $user): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can view cart counts.',
            ], 403);
        }

        $customerId = $user->customer?->id;

        if (!$customerId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        $count = CartItem::query()
            ->whereHas('cart', function ($query) use ($customerId) {
                $query->where('customer_id', $customerId)
                    ->where('status', 'active');
            })->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'count' => (int) $count,
            ],
        ]);
    }

    /**
     * Add a pharmacy product to the authenticated customer's active cart.
     */
    public function addItem(?User $user, array $payload): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can add items to cart.',
            ], 403);
        }

        $customerId = $user->customer?->id;

        if (!$customerId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        $pharmacyId = (int) $payload['pharmacy_id'];
        $pharmacyProductId = (int) $payload['pharmacy_product_id'];
        $quantityToAdd = (int) ($payload['quantity'] ?? 1);

        try {
            $result = DB::transaction(function () use ($customerId, $pharmacyId, $pharmacyProductId, $quantityToAdd) {
                $pharmacyProduct = PharmacyProduct::query()
                    ->with('product:id,is_prescribed')
                    ->lockForUpdate()
                    ->findOrFail($pharmacyProductId);

                if ($pharmacyProduct->pharmacy_id !== $pharmacyId) {
                    throw ValidationException::withMessages([
                        'pharmacy_product_id' => ['Selected product does not belong to the selected pharmacy.'],
                    ]);
                }

                if (!$pharmacyProduct->is_available) {
                    throw ValidationException::withMessages([
                        'pharmacy_product_id' => ['This product is currently unavailable.'],
                    ]);
                }

                if ($pharmacyProduct->stock < $quantityToAdd) {
                    throw ValidationException::withMessages([
                        'quantity' => ['Requested quantity exceeds available stock.'],
                    ]);
                }

                $cart = Cart::query()->firstOrCreate([
                    'customer_id' => $customerId,
                    'pharmacy_id' => $pharmacyId,
                    'status' => 'active',
                ]);

                $cartItem = CartItem::query()
                    ->where('cart_id', $cart->id)
                    ->where('pharmacy_product_id', $pharmacyProduct->id)
                    ->lockForUpdate()
                    ->first();

                $wasCreated = false;

                if ($cartItem) {
                    $newQuantity = $cartItem->quantity + $quantityToAdd;

                    if ($pharmacyProduct->stock < $newQuantity) {
                        throw ValidationException::withMessages([
                            'quantity' => ['Total quantity in cart exceeds available stock.'],
                        ]);
                    }

                    $cartItem->update([
                        'quantity' => $newQuantity,
                        'price_snapshot' => $pharmacyProduct->selling_price,
                    ]);
                } else {
                    $cartItem = CartItem::query()->create([
                        'cart_id' => $cart->id,
                        'pharmacy_product_id' => $pharmacyProduct->id,
                        'quantity' => $quantityToAdd,
                        'price_snapshot' => $pharmacyProduct->selling_price,
                    ]);
                    $wasCreated = true;
                }

                return [
                    'cart' => $cart,
                    'cart_item' => $cartItem,
                    'prescription_required' => (bool) ($pharmacyProduct->product?->is_prescribed ?? false),
                    'was_created' => $wasCreated,
                ];
            });
        } catch (ValidationException $exception) {
            return response()->json([
                'status' => 'error',
                'message' => $this->firstValidationMessage($exception),
                'errors' => $exception->errors(),
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => $result['was_created'] ? 'Item added to cart successfully.' : 'Cart item quantity updated successfully.',
            'data' => [
                'cart' => $result['cart'],
                'cart_item' => $result['cart_item'],
                'prescription_required' => $result['prescription_required'],
            ],
        ], $result['was_created'] ? 201 : 200);
    }

    private function firstValidationMessage(ValidationException $exception): string
    {
        return collect($exception->errors())->flatten()->first() ?? 'Validation failed.';
    }
}
