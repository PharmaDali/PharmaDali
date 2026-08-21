<?php

namespace App\Services\Pos;

use App\Models\PharmacyProduct;
use App\Models\Order;
use App\Models\OrderItem;
use App\Notifications\OrderCompletedNotification;
use App\Services\Inventory\InventoryLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Services\Messaging\ConversationService;
use App\Models\Pharmacy;

class PosService
{
    public function __construct(
        private readonly InventoryLogService $logService,
    ) {}
    /**
     * Get products for POS with infinite scroll and search functionality.
     */
    public function getProducts(array $filters)
    {
        $search = $filters['search'] ?? null;
        $perPage = $filters['per_page'] ?? 20;

        $query = PharmacyProduct::with(['product', 'category'])
            ->where('is_available', true);

        if ($search) {
            $query->whereHas('product', function ($pq) use ($search) {
                $pq->where('product_name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('brand_name', 'like', "%{$search}%")
                  ->orWhere('strength', 'like', "%{$search}%")
                  ->orWhere('form', 'like', "%{$search}%")
                  ->orWhere('size', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new order from the POS.
     */
    public function createOrder(array $data, $user)
    {
        if (!$user) {
            throw new \Exception("Unauthorized");
        }

        return DB::transaction(function () use ($data, $user) {
            $subtotal = 0;
            $items = $data['items'] ?? [];

            // Calculate subtotal and validate stock
            foreach ($items as $item) {
                $pharmacyProduct = PharmacyProduct::findOrFail($item['id']);
                
                if ($pharmacyProduct->stock < $item['qty']) {
                    throw new \Exception("Insufficient stock for product: " . ($pharmacyProduct->product->product_name ?? 'Item'));
                }

                $subtotal += $item['qty'] * $pharmacyProduct->selling_price;
            }

            $pharmacy = $user->pharmacy ?? (Pharmacy::find($user->pharmacy_id ?? 1));

            // Calculate discount details based on pharmacy policy and input
            $discountType = $data['discount_type'] ?? 'none';
            $discountPercentageInput = isset($data['discount_percentage']) ? (float) $data['discount_percentage'] : null;
            $discountAmountInput = isset($data['discount_amount']) ? (float) $data['discount_amount'] : null;

            [$discountAmount, $discountPercentage] = $this->calculateDiscount(
                subtotal: $subtotal,
                discountType: $discountType,
                discountPercentage: $discountPercentageInput,
                discountAmount: $discountAmountInput,
                pharmacy: $pharmacy
            );

            $totalAmount = max(0, round($subtotal - $discountAmount, 2));
            $amountReceived = isset($data['amount_received']) ? (float) $data['amount_received'] : $totalAmount;
            $changeAmount = isset($data['change_amount']) ? (float) $data['change_amount'] : max(0, round($amountReceived - $totalAmount, 2));

            // Create the order
            $order = Order::create([
                'order_number' => 'POS-' . strtoupper(Str::random(10)),
                'pharmacy_id' => $pharmacy?->id ?? 1,
                'status' => 'completed',
                'verified_by' => $user->id,
                'verified_at' => now(),
                'payment_method' => $data['payment_method'] ?? 'cash',
                'payment_status' => 'paid',
                'subtotal' => $subtotal,
                'discount_type' => $discountType,
                'discount_percentage' => $discountPercentage,
                'discount_id_number' => $data['discount_id_number'] ?? null,
                'discount_remarks' => $data['discount_remarks'] ?? null,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'amount_received' => $amountReceived,
                'change_amount' => $changeAmount,
                'placed_at' => now(),
                'completed_at' => now(),
                'note' => $data['note'] ?? 'POS Walk-in Sale',
            ]);

            // Create order items and update stock
            foreach ($items as $item) {
                $pharmacyProduct = PharmacyProduct::with('product')->findOrFail($item['id']);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'pharmacy_product_id' => $pharmacyProduct->id,
                    'quantity' => $item['qty'],
                    'unit_price_snapshot' => $pharmacyProduct->selling_price,
                    'line_total' => $item['qty'] * $pharmacyProduct->selling_price,
                    'product_name' => $pharmacyProduct->product->product_name ?? 'Unknown Product',
                ]);

                // Update stock
                $pharmacyProduct->decrement('stock', $item['qty']);

                $this->logService->logStockOut(
                    pharmacyId:         $pharmacyProduct->pharmacy_id,
                    pharmacyProductId:  $pharmacyProduct->id,
                    batchId:            null, // POS uses direct decrement, no FEFO batch tracking
                    quantity:           $item['qty'],
                    reason:             'POS Sale: ' . $order->order_number,
                );
            }

            return $order;
        });
    }

    /**
     * Get pickup orders for the pharmacy with search and filtering.
     */
    public function getPickupOrders(array $filters, $user)
    {
        if (!$user) {
            throw new \Exception("Unauthorized");
        }

        $pharmacyId = $user->pharmacy_id;
        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? 'all'; // all, ready, completed

        $query = Order::with([
            'customer.user',
            'items.pharmacyProduct.product',
            'items.pharmacyProduct.category'
        ])
        ->whereNotNull('customer_id'); // Pickup orders always have a customer

        if ($pharmacyId) {
            $query->where('pharmacy_id', $pharmacyId);
        }

        // Status Filtering
        $statusInput = strtolower(trim((string) ($filters['status'] ?? 'all')));

        if (in_array($statusInput, ['ready', 'ready_for_pickup', 'for_pickup', 'for pickup'], true)) {
            $query->where('status', 'ready_for_pickup');
        } elseif ($statusInput === 'completed') {
            $query->where('status', 'completed');
        } else {
            // 'all' includes ready_for_pickup and completed by default for this tab
            $query->whereIn('status', ['ready_for_pickup', 'completed']);
        }

        // Search functionality
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer.user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('mobile_number', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest()->get();

        $orders->transform(function ($order) {
            $user = $order->customer?->user;
            $order->customer_name = $user ? trim("{$user->first_name} {$user->last_name}") : ($order->customer_name ?? 'Customer');
            $order->customer_phone = $user?->mobile_number ?? $user?->phone ?? $order->customer_phone ?? null;
            return $order;
        });

        return $orders;
    }

    /**
     * Complete a pickup order and update payment info (with optional discount application).
     */
    public function completePickupOrder(
        Order $order, 
        $paymentMethod, 
        $user, 
        $amountReceived = null, 
        $changeAmount = null,
        array $discountData = []
    ) {
        if (is_array($paymentMethod)) {
            $paymentMethod = $paymentMethod['id'] ?? $paymentMethod['value'] ?? 'cash';
        }
        $paymentMethod = is_string($paymentMethod) ? strtolower($paymentMethod) : 'cash';

        if ($order->pharmacy_id !== $user->pharmacy_id) {
            throw new \Exception("Unauthorized: Order does not belong to your pharmacy.");
        }

        if ($order->status === 'completed') {
            throw new \Exception("Order is already completed.");
        }

        if ($order->status !== 'ready_for_pickup') {
            throw new \Exception("Order must be in 'ready_for_pickup' status to be completed at POS.");
        }

        return DB::transaction(function () use ($order, $paymentMethod, $user, $amountReceived, $changeAmount, $discountData) {
            $pharmacy = $user->pharmacy ?? (Pharmacy::find($user->pharmacy_id));
            
            // Calculate subtotal from order items if subtotal is 0
            $subtotal = (float) $order->subtotal;
            if ($subtotal <= 0) {
                $subtotal = (float) $order->items->sum('line_total');
            }

            $discountType = $discountData['discount_type'] ?? $order->discount_type ?? 'none';
            $discountPercentageInput = isset($discountData['discount_percentage']) 
                ? (float) $discountData['discount_percentage'] 
                : ($order->discount_percentage > 0 ? (float) $order->discount_percentage : null);
            $discountAmountInput = isset($discountData['discount_amount']) 
                ? (float) $discountData['discount_amount'] 
                : ($order->discount_amount > 0 ? (float) $order->discount_amount : null);

            [$discountAmount, $discountPercentage] = $this->calculateDiscount(
                subtotal: $subtotal,
                discountType: $discountType,
                discountPercentage: $discountPercentageInput,
                discountAmount: $discountAmountInput,
                pharmacy: $pharmacy
            );

            $totalAmount = max(0, round($subtotal - $discountAmount, 2));
            $finalAmountReceived = $amountReceived !== null ? (float) $amountReceived : $totalAmount;
            $finalChangeAmount = $changeAmount !== null ? (float) $changeAmount : max(0, round($finalAmountReceived - $totalAmount, 2));

            $updateData = [
                'status' => 'completed',
                'verified_by' => $user->id,
                'verified_at' => now(),
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'subtotal' => $subtotal,
                'discount_type' => $discountType,
                'discount_percentage' => $discountPercentage,
                'discount_id_number' => $discountData['discount_id_number'] ?? $order->discount_id_number,
                'discount_remarks' => $discountData['discount_remarks'] ?? $order->discount_remarks,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'amount_received' => $finalAmountReceived,
                'change_amount' => $finalChangeAmount,
                'completed_at' => now(),
                'picked_up_at' => now(),
            ];

            $order->update($updateData);

            // Notify customer that order is completed
            if ($order->customer && $order->customer->user) {
                $order->customer->user->notify(new OrderCompletedNotification($order));
            }

            try {
                $conversationService = app(ConversationService::class);
                $msg = $conversationService->appendSystemMessage($order, 'Order completed', [
                    'status' => 'completed',
                ]);
                $msg->conversation()->update([
                    'status' => 'closed',
                    'closed_at' => now(),
                ]);
            } catch (\Throwable $e) {
                // Fail-safe to avoid blocking order completion if chat system fails
                Log::error('Failed to append system message or close conversation: ' . $e->getMessage());
            }

            return $order->load(['customer.user', 'items.pharmacyProduct.product']);
        });
    }

    /**
     * Calculate discount amount & percentage based on pharmacy configuration and policy.
     */
    private function calculateDiscount(
        float $subtotal,
        ?string $discountType,
        ?float $discountPercentage,
        ?float $discountAmount,
        ?Pharmacy $pharmacy = null
    ): array {
        if (!$discountType || $discountType === 'none' || $subtotal <= 0) {
            return [0.00, 0.00];
        }

        $calculatedAmount = 0.00;
        $calculatedPercentage = 0.00;

        if ($discountPercentage !== null && $discountPercentage > 0) {
            $calculatedPercentage = min(100.00, max(0.00, $discountPercentage));
            
            // Check if pharmacy settings enable statutory Philippine VAT exemption on Senior / PWD discounts
            $isVatExemptEligible = $pharmacy
                && !empty($pharmacy->enable_vat_exemption_discount)
                && $pharmacy->vat_type === 'vat'
                && in_array(strtolower($discountType), ['senior', 'pwd', 'senior_citizen']);

            if ($isVatExemptEligible) {
                // VAT-exclusive base = subtotal / 1.12
                $vatExclusiveSubtotal = round($subtotal / 1.12, 2);
                $calculatedAmount = round($vatExclusiveSubtotal * ($calculatedPercentage / 100), 2);
            } else {
                // Standard percentage discount applied to subtotal
                $calculatedAmount = round($subtotal * ($calculatedPercentage / 100), 2);
            }
        } elseif ($discountAmount !== null && $discountAmount > 0) {
            $calculatedAmount = min($subtotal, max(0.00, $discountAmount));
            $calculatedPercentage = round(($calculatedAmount / $subtotal) * 100, 2);
        }

        return [
            round($calculatedAmount, 2),
            round($calculatedPercentage, 2)
        ];
    }
}
