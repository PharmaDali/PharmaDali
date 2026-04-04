<?php

namespace App\Services\Cart;

use App\Models\BranchProduct;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerCartService
{
    /**
     * Add a branch product to the authenticated customer's active cart.
     */
    public function addItem(?User $user, array $payload): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can add items to cart.',
            ], 403);
        }

        $branchId = (int) $payload['branch_id'];
        $branchProductId = (int) $payload['branch_product_id'];
        $quantityToAdd = (int) ($payload['quantity'] ?? 1);

        try {
            $result = DB::transaction(function () use ($user, $branchId, $branchProductId, $quantityToAdd) {
                $branchProduct = BranchProduct::query()
                    ->lockForUpdate()
                    ->findOrFail($branchProductId);

                if ($branchProduct->branch_id !== $branchId) {
                    throw ValidationException::withMessages([
                        'branch_product_id' => ['Selected product does not belong to the selected branch.'],
                    ]);
                }

                if (!$branchProduct->is_available) {
                    throw ValidationException::withMessages([
                        'branch_product_id' => ['This product is currently unavailable.'],
                    ]);
                }

                if ($branchProduct->stock < $quantityToAdd) {
                    throw ValidationException::withMessages([
                        'quantity' => ['Requested quantity exceeds available stock.'],
                    ]);
                }

                $cart = Cart::query()->firstOrCreate([
                    'customer_id' => $user->id,
                    'branch_id' => $branchId,
                    'status' => 'active',
                ]);

                $cartItem = CartItem::query()
                    ->where('cart_id', $cart->id)
                    ->where('product_id', $branchProduct->id)
                    ->lockForUpdate()
                    ->first();

                $wasCreated = false;

                if ($cartItem) {
                    $newQuantity = $cartItem->quantity + $quantityToAdd;

                    if ($branchProduct->stock < $newQuantity) {
                        throw ValidationException::withMessages([
                            'quantity' => ['Total quantity in cart exceeds available stock.'],
                        ]);
                    }

                    $cartItem->update([
                        'quantity' => $newQuantity,
                        'price_snapshot' => $branchProduct->selling_price,
                    ]);
                } else {
                    $cartItem = CartItem::query()->create([
                        'cart_id' => $cart->id,
                        'product_id' => $branchProduct->id,
                        'quantity' => $quantityToAdd,
                        'price_snapshot' => $branchProduct->selling_price,
                    ]);
                    $wasCreated = true;
                }

                return [
                    'cart' => $cart,
                    'cart_item' => $cartItem,
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
            ],
        ], $result['was_created'] ? 201 : 200);
    }

    private function firstValidationMessage(ValidationException $exception): string
    {
        return collect($exception->errors())->flatten()->first() ?? 'Validation failed.';
    }
}
