<?php

namespace App\Services\OrderItemPrescription;

use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UploadOrderItemPrescriptionService
{
    public function handle(?User $user, int $orderItemId, UploadedFile $image): JsonResponse
    {
        if (! $user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can upload prescription images.',
            ], 403);
        }

        $customerId = $user->customer?->id;

        if (! $customerId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        $orderItem = OrderItem::query()
            ->where('id', $orderItemId)
            ->whereHas('order', function ($query) use ($customerId) {
                $query->where('customer_id', $customerId);
            })
            ->first();

        if (! $orderItem) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order item not found or does not belong to this customer.',
            ], 404);
        }

        $storedPath = $image->store('prescriptions/order-items', 'public');

        $record = DB::transaction(function () use ($orderItemId, $storedPath) {
            return OrderItemPrescription::query()->updateOrCreate(
                ['order_item_id' => $orderItemId],
                [
                    'prescription_image_path' => $storedPath,
                    'status' => 'pending',
                    'verified_by' => null,
                    'verified_at' => null,
                    'rejection_reason' => null,
                ],
            );
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Prescription image uploaded successfully.',
            'data' => [
                'order_item_id' => $record->order_item_id,
                'prescription_image_path' => $record->prescription_image_path,
                'status' => $record->status,
            ],
        ]);
    }
}
