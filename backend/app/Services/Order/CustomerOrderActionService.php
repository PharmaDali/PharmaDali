<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use App\Enums\OrderStatus;
use App\Services\Messaging\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerOrderActionService
{
    public function __construct(
        private readonly ConversationService $conversationService,
    ) {}

    /**
     * Customer confirms in-store payment notice (when GCash receipt was rejected).
     */
    public function confirmInStorePayment(?User $user, Order $order): JsonResponse
    {
        if (!$this->isAuthorizedCustomer($user, $order)) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        if ($order->status !== OrderStatus::STAND_BY) {
            return response()->json(['status' => 'error', 'message' => 'Order is not awaiting confirmation.'], 422);
        }

        $order->update([
            'status' => OrderStatus::REVIEWING,
        ]);

        $this->conversationService->appendSystemMessage($order, 'Customer acknowledged in-store payment upon pickup.');

        return response()->json([
            'status' => 'success',
            'message' => 'Confirmed. You may pay at the pharmacy upon pickup.',
            'data' => $order->fresh(),
        ]);
    }

    /**
     * Customer acknowledges discount notice (when online ID was rejected).
     */
    public function acknowledgeDiscount(?User $user, Order $order): JsonResponse
    {
        if (!$this->isAuthorizedCustomer($user, $order)) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        if ($order->status !== OrderStatus::STAND_BY) {
            return response()->json(['status' => 'error', 'message' => 'Order is not awaiting confirmation.'], 422);
        }

        $order->update([
            'status' => OrderStatus::REVIEWING,
        ]);

        $this->conversationService->appendSystemMessage($order, 'Customer acknowledged requirement to present physical ID upon pickup.');

        return response()->json([
            'status' => 'success',
            'message' => 'Confirmed. Please bring your physical ID upon pickup.',
            'data' => $order->fresh(),
        ]);
    }

    /**
     * Customer removes rejected prescription items from a mixed order and proceeds with OTC items.
     */
    public function removeRxItemsAndProceed(?User $user, Order $order): JsonResponse
    {
        if (!$this->isAuthorizedCustomer($user, $order)) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 403);
        }

        if ($order->status !== OrderStatus::STAND_BY) {
            return response()->json(['status' => 'error', 'message' => 'Order is not in stand_by status.'], 422);
        }

        return DB::transaction(function () use ($order) {
            $order->load(['items.pharmacyProduct.product', 'items.orderItemPrescription']);

            // Find items that require prescription or have a prescription record attached
            $rxItems = $order->items->filter(function ($item) {
                $isPrescribed = (bool) ($item->pharmacyProduct->product->is_prescribed ?? false);
                $hasRxRecord = (bool) $item->orderItemPrescription;
                return $isPrescribed || $hasRxRecord;
            });

            if ($rxItems->isEmpty()) {
                return response()->json(['status' => 'error', 'message' => 'No prescription items found to remove.'], 422);
            }

            foreach ($rxItems as $rxItem) {
                if ($rxItem->orderItemPrescription) {
                    $rxItem->orderItemPrescription->delete();
                }
                $rxItem->delete();
            }

            // Reload remaining items
            $order->load('items');
            $remainingItems = $order->items;

            if ($remainingItems->isEmpty()) {
                // If no items left, cancel the order
                $order->update([
                    'status' => OrderStatus::CANCELLED,
                    'cancelled_at' => now(),
                    'cancellation_reason' => 'All prescription items were removed by customer.',
                ]);

                $this->conversationService->appendSystemMessage($order, 'Order cancelled: all items were removed.');

                return response()->json([
                    'status' => 'success',
                    'message' => 'Order cancelled as all items were removed.',
                    'data' => $order->fresh(),
                ]);
            }

            // Recalculate totals
            $newSubtotal = $remainingItems->sum('line_total');
            $discountAmount = (float) ($order->discount_amount ?? 0);
            $newTotal = max(0, $newSubtotal - $discountAmount);

            $order->update([
                'subtotal' => $newSubtotal,
                'total_amount' => $newTotal,
                'status' => OrderStatus::REVIEWING,
            ]);

            $this->conversationService->appendSystemMessage(
                $order,
                'Customer removed prescription items. Order updated to proceed with OTC items.'
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Prescription items removed. Order will proceed with remaining items.',
                'data' => $order->fresh(['items.pharmacyProduct.product']),
            ]);
        });
    }

    private function isAuthorizedCustomer(?User $user, Order $order): bool
    {
        if (!$user || $user->role !== 'customer') {
            return false;
        }

        return (int) ($user->customer->id ?? 0) === (int) $order->customer_id;
    }
}

