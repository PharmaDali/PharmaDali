<?php

namespace App\Services\Pos;

use App\Models\Pharmacy;
use App\Repositories\PosRepository;
use App\Repositories\ProductBatchRepository;
use App\Services\Inventory\InventoryLogService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosOrderService
{
    public function __construct(
        private readonly PosRepository $posRepository,
        private readonly ProductBatchRepository $batchRepository,
        private readonly PosDiscountCalculator $discountCalculator,
        private readonly InventoryLogService $logService,
    ) {}

    /**
     * Create a new walk-in order from the POS.
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
                $pharmacyProduct = $this->posRepository->findPharmacyProduct($item['id']);
                
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

            [$discountAmount, $discountPercentage] = $this->discountCalculator->calculateDiscount(
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
            $order = $this->posRepository->createOrder([
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
                $pharmacyProduct = $this->posRepository->findPharmacyProduct($item['id']);
                
                $this->posRepository->createOrderItem([
                    'order_id' => $order->id,
                    'pharmacy_product_id' => $pharmacyProduct->id,
                    'quantity' => $item['qty'],
                    'unit_price_snapshot' => $pharmacyProduct->selling_price,
                    'line_total' => $item['qty'] * $pharmacyProduct->selling_price,
                    'product_name' => $pharmacyProduct->product->product_name ?? 'Unknown Product',
                ]);

                // Update stock using FEFO batch deduction
                $deductionLog = $this->batchRepository->stockOutFefo($pharmacyProduct->id, $item['qty']);

                // Log each batch deduction
                foreach ($deductionLog as $batchLog) {
                    $this->logService->logStockOut(
                        pharmacyId:         $pharmacyProduct->pharmacy_id,
                        pharmacyProductId:  $pharmacyProduct->id,
                        batchId:            $batchLog['batch_id'],
                        quantity:           $batchLog['deducted'],
                        reason:             'POS Sale: ' . $order->order_number,
                    );
                }
            }

            return $order;
        });
    }
}
