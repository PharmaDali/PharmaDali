<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\UploadPaymentReceiptImageRequest;
use App\Models\Order;
use App\Services\Order\UploadPaymentReceiptImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class PaymentReceiptUploadController extends Controller
{
    public function __construct(
        private readonly UploadPaymentReceiptImageService $uploadPaymentReceiptImageService
    ) {}

    /**
     * Upload and compress customer GCash payment receipt image for an order.
     *
     * @param UploadPaymentReceiptImageRequest $request
     * @param Order                            $order
     * @return JsonResponse
     */
    public function upload(UploadPaymentReceiptImageRequest $request, Order $order): JsonResponse
    {
        try {
            $updatedOrder = $this->uploadPaymentReceiptImageService->handle(
                $order,
                $request->file('payment_receipt_image'),
                $request->user()
            );

            return $this->successResponse([
                'order_id'                   => $updatedOrder->id,
                'payment_receipt_image_path' => $updatedOrder->payment_receipt_image_path,
                'payment_receipt_image_url'  => Storage::disk('public')->url($updatedOrder->payment_receipt_image_path),
            ], 'Customer GCash payment receipt uploaded and compressed successfully.');
        } catch (\Exception $e) {
            $statusCode = in_array($e->getCode(), [401, 403, 404, 422]) ? $e->getCode() : 400;
            return $this->errorResponse($e->getMessage(), $statusCode);
        }
    }
}
