<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\UploadOrderItemPrescriptionRequest;
use App\Services\OrderItemPrescription\UploadOrderItemPrescriptionService;
use Illuminate\Http\JsonResponse;

class OrderItemPrescriptionController extends Controller
{
	public function __construct(
		private readonly UploadOrderItemPrescriptionService $uploadOrderItemPrescriptionService,
	) {}

	public function upload(UploadOrderItemPrescriptionRequest $request, int $orderItem): JsonResponse
	{
		return $this->uploadOrderItemPrescriptionService->handle(
			$request->user(),
			$orderItem,
			$request->file('prescription_image'),
		);
	}
}
