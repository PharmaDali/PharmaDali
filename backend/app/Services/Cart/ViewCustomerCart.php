<?php

namespace App\Services\Cart;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ViewCustomerCart
{
	public function handle(?User $user): JsonResponse
	{
		if (!$user || $user->role !== 'customer') {
			return response()->json([
				'status' => 'error',
				'message' => 'Only customers can view cart items.',
			], 403);
		}

		$cartItems = CartItem::query()
			->with([
				'cart:id,customer_id,branch_id,status',
				'cart.branch:id,branch_name,location',
				'branchProduct:id,branch_id,product_id,category_id,stock,selling_price,is_available,expiry_date',
				'branchProduct.product:id,product_type,product_name,generic_name,brand_name,description,form,strength',
				'branchProduct.category:id,category_name,description',
			])
			->whereHas('cart', function ($query) use ($user) {
				$query->where('customer_id', $user->id)
					->where('status', 'active');
			})
			->latest('id')
			->get();

		$items = $cartItems->map(function (CartItem $item) {
			$quantity = (int) $item->quantity;
			$unitPrice = (float) $item->price_snapshot;

			return [
				'id' => $item->id,
				'cart_id' => $item->cart_id,
				'branch_product_id' => $item->product_id,
				'quantity' => $quantity,
				'unit_price' => $unitPrice,
				'line_total' => round($quantity * $unitPrice, 2),
				'branch' => [
					'id' => $item->cart?->branch?->id,
					'branch_name' => $item->cart?->branch?->branch_name,
					'location' => $item->cart?->branch?->location,
				],
				'product' => [
					'id' => $item->branchProduct?->product?->id,
					'product_type' => $item->branchProduct?->product?->product_type,
					'product_name' => $item->branchProduct?->product?->product_name,
					'generic_name' => $item->branchProduct?->product?->generic_name,
					'brand_name' => $item->branchProduct?->product?->brand_name,
					'description' => $item->branchProduct?->product?->description,
					'form' => $item->branchProduct?->product?->form,
					'strength' => $item->branchProduct?->product?->strength,
				],
				'category' => [
					'id' => $item->branchProduct?->category?->id,
					'category_name' => $item->branchProduct?->category?->category_name,
					'description' => $item->branchProduct?->category?->description,
				],
				'availability' => [
					'is_available' => (bool) ($item->branchProduct?->is_available ?? false),
					'stock' => (int) ($item->branchProduct?->stock ?? 0),
					'current_selling_price' => (float) ($item->branchProduct?->selling_price ?? 0),
					'expiry_date' => $item->branchProduct?->expiry_date,
				],
				'created_at' => $item->created_at,
				'updated_at' => $item->updated_at,
			];
		})->values();

		$totalItems = (int) $items->sum('quantity');
		$subtotal = (float) round($items->sum('line_total'), 2);

		return response()->json([
			'status' => 'success',
			'data' => [
				'items' => $items,
				'summary' => [
					'item_count' => $items->count(),
					'total_quantity' => $totalItems,
					'subtotal' => $subtotal,
				],
			],
		]);
	}
}
