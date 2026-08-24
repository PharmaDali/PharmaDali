<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\UploadDiscountIdImageRequest;
use App\Models\Order;
use App\Services\Order\UploadDiscountIdImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DiscountIdUploadController extends Controller
{
    public function __construct(
        private readonly UploadDiscountIdImageService $uploadDiscountIdImageService
    ) {}

    /**
     * Upload and compress customer ID image for discount verification.
     *
     * @param UploadDiscountIdImageRequest $request
     * @param Order                        $order
     * @return JsonResponse
     */
    public function upload(UploadDiscountIdImageRequest $request, Order $order): JsonResponse
    {
        try {
            $updatedOrder = $this->uploadDiscountIdImageService->handle(
                $order,
                $request->file('discount_id_image'),
                $request->user()
            );

            return $this->successResponse([
                'order_id'               => $updatedOrder->id,
                'discount_id_image_path' => $updatedOrder->discount_id_image_path,
                'discount_id_image_url'  => Storage::disk('public')->url($updatedOrder->discount_id_image_path),
            ], 'Discount customer ID uploaded and compressed successfully.');
        } catch (\Exception $e) {
            $statusCode = in_array($e->getCode(), [401, 403, 404, 422]) ? $e->getCode() : 400;
            return $this->errorResponse($e->getMessage(), $statusCode);
        }
    }
}
