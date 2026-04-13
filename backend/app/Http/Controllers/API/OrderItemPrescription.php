<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadOrderItemPrescriptionRequest;
use App\Services\OrderItemPrescription\UploadOrderItemPrescriptionService;
use Illuminate\Http\JsonResponse;

class OrderItemPrescription extends Controller
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
