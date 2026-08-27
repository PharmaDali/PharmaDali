<?php

namespace App\Services\Pos;

use App\Models\Order;
use App\Models\Pharmacy;
use App\Notifications\OrderCompletedNotification;
use App\Repositories\PosRepository;
use App\Repositories\ProductBatchRepository;
use App\Services\Inventory\InventoryLogService;
use App\Services\Messaging\ConversationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;

class PosPickupOrderService
{
    public function __construct(
        private readonly PosRepository $posRepository,
        private readonly ProductBatchRepository $batchRepository,
        private readonly PosDiscountCalculator $discountCalculator,
        private readonly InventoryLogService $logService
    ) {}

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
        $status = $filters['status'] ?? 'all';

        return $this->posRepository->getPickupOrders($pharmacyId, $status, $search);
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

        if ($order->status === OrderStatus::COMPLETED) {
            throw new \Exception("Order is already completed.");
        }

        if ($order->status !== OrderStatus::READY_FOR_PICKUP) {
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

            [$discountAmount, $discountPercentage] = $this->discountCalculator->calculateDiscount(
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
                'status' => OrderStatus::COMPLETED,
                'verified_by' => $user->id,
                'verified_at' => now(),
                'payment_method' => $paymentMethod,
                'payment_status' => PaymentStatus::PAID,
                'subtotal' => $subtotal,
                'discount_type' => $discountType,
                'discount_percentage' => $discountPercentage,
                'discount_id_number' => $discountData['discount_id_number'] ?? $order->discount_id_number,
                'discount_id_image_path' => $discountData['discount_id_image_path'] ?? $order->discount_id_image_path,
                'discount_remarks' => $discountData['discount_remarks'] ?? $order->discount_remarks,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'amount_received' => $finalAmountReceived,
                'change_amount' => $finalChangeAmount,
                'completed_at' => now(),
                'picked_up_at' => now(),
            ];

            $this->posRepository->updateOrder($order, $updateData);

            // Deduct stock via FEFO for all items in the pickup order
            foreach ($order->items as $item) {
                $deductionLog = $this->batchRepository->stockOutFefo($item->pharmacy_product_id, $item->quantity);

                foreach ($deductionLog as $batchLog) {
                    $this->logService->logStockOut(
                        pharmacyId:         $order->pharmacy_id,
                        pharmacyProductId:  $item->pharmacy_product_id,
                        batchId:            $batchLog['batch_id'],
                        quantity:           $batchLog['deducted'],
                        reason:             'Pickup Order Completed: ' . $order->order_number,
                    );
                }
            }

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
                Log::error('Failed to append system message or close conversation: ' . $e->getMessage());
            }

            return $order->load(['customer.user', 'items.pharmacyProduct.product']);
        });
    }
}
