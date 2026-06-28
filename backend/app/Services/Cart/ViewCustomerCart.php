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

		$customerId = $user->customer?->id;

		if (!$customerId) {
			return response()->json([
				'status' => 'error',
				'message' => 'Customer profile not found.',
			], 403);
		}

		$cartItems = CartItem::query()
			->with([
				'cart:id,customer_id,pharmacy_id,status',
				'cart.pharmacy:id,pharmacy_name,location',
				'pharmacyProduct:id,pharmacy_id,product_id,category_id,stock,selling_price,is_available',
				'pharmacyProduct.batches:id,pharmacy_product_id,stock,expiry_date',
				'pharmacyProduct.product:id,product_type,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed',
				'pharmacyProduct.category:id,category_name,description',
			])
			->whereHas('cart', function ($query) use ($customerId) {
				$query->where('customer_id', $customerId)
					->where('status', 'active');
			})
			->latest('id')
			->get();

		$items = $cartItems->map(function (CartItem $item) {
			$quantity = (int) $item->quantity;
			$unitPrice = (float) $item->price_snapshot;
			$prescriptionRequired = (bool) ($item->pharmacyProduct?->product?->is_prescribed ?? false);

			return [
				'id' => $item->id,
				'cart_id' => $item->cart_id,
				'pharmacy_product_id' => $item->pharmacy_product_id,
				'quantity' => $quantity,
				'unit_price' => $unitPrice,
				'line_total' => round($quantity * $unitPrice, 2),
				'pharmacy' => [
					'id' => $item->cart?->pharmacy?->id,
					'pharmacy_name' => $item->cart?->pharmacy?->pharmacy_name,
					'location' => $item->cart?->pharmacy?->location,
				],
				'product' => [
					'id' => $item->pharmacyProduct?->product?->id,
					'product_type' => $item->pharmacyProduct?->product?->product_type,
					'product_name' => $item->pharmacyProduct?->product?->product_name,
					'generic_name' => $item->pharmacyProduct?->product?->generic_name,
					'brand_name' => $item->pharmacyProduct?->product?->brand_name,
					'description' => $item->pharmacyProduct?->product?->description,
					'form' => $item->pharmacyProduct?->product?->form,
					'strength' => $item->pharmacyProduct?->product?->strength,
					'size' => $item->pharmacyProduct?->product?->size,
					'is_prescribed' => $prescriptionRequired,
				],
				'prescription_required' => $prescriptionRequired,
				'category' => [
					'id' => $item->pharmacyProduct?->category?->id,
					'category_name' => $item->pharmacyProduct?->category?->category_name,
					'description' => $item->pharmacyProduct?->category?->description,
				],
				'availability' => [
					'is_available' => (bool) ($item->pharmacyProduct?->is_available ?? false),
					'stock' => (int) ($item->pharmacyProduct?->stock ?? 0),
					'current_selling_price' => (float) ($item->pharmacyProduct?->selling_price ?? 0),
					'expiry_date' => $item->pharmacyProduct?->batches
						?->whereNotNull('expiry_date')
						?->where('stock', '>', 0)
						?->sortBy('expiry_date')
						?->first()?->expiry_date?->toDateString(),
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
