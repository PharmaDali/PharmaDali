<?php

namespace App\Services\UserProfile;

use App\Models\Pharmacist;
use Illuminate\Http\JsonResponse;

class DisplayPharmacistProfile
{
	public function handle(?Pharmacist $pharmacist): JsonResponse
	{
		if (!$pharmacist) {
			return response()->json([
				'status' => 'error',
				'message' => 'Pharmacist profile not found.',
			], 404);
		}

		$pharmacist->load([
			'user:id,first_name,last_name,email,role,pharmacy_id,mobile_number,address,date_of_birth',
			'user.pharmacy:id,pharmacy_name,location,is_active,is_manually_closed,opening_hour,closing_hour',
		]);

		if (($pharmacist->user?->role ?? null) !== 'pharmacist') {
			return response()->json([
				'status' => 'error',
				'message' => 'Only pharmacists can view this profile.',
			], 403);
		}

		$pharmacy = $pharmacist->user?->pharmacy;
		$isPharmacyOpen = (bool) ($pharmacy?->isCurrentlyOpen() ?? false);

		if (!$isPharmacyOpen && $pharmacist->is_on_duty) {
			$pharmacist->update([
				'is_on_duty'      => false,
				'duty_updated_at' => now(),
			]);
		}

		return response()->json([
			'status' => 'success',
			'data' => [
				'id' => $pharmacist->id,
				'employee_number' => $pharmacist->employee_number,
				'license_number' => $pharmacist->license_number,
				'requires_password_change' => (bool) $pharmacist->requires_password_change,
				'is_on_duty' => $isPharmacyOpen && (bool) ($pharmacist->is_on_duty ?? true),
				'is_pharmacy_open' => $isPharmacyOpen,
				'duty_updated_at' => $pharmacist->duty_updated_at?->toIso8601String(),
				'user' => [
					'id' => $pharmacist->user?->id,
					'first_name' => $pharmacist->user?->first_name,
					'last_name' => $pharmacist->user?->last_name,
					'email' => $pharmacist->user?->email,
					'role' => $pharmacist->user?->role,
					'mobile_number' => $pharmacist->user?->mobile_number,
					'address' => $pharmacist->user?->address,
					'date_of_birth' => $pharmacist->user?->date_of_birth,
					'requires_password_change' => (bool) $pharmacist->requires_password_change,
				],
				'pharmacy' => [
					'id' => $pharmacy?->id,
					'pharmacy_name' => $pharmacy?->pharmacy_name,
					'location' => $pharmacy?->location,
					'is_open' => $isPharmacyOpen,
					'is_manually_closed' => (bool) ($pharmacy?->is_manually_closed ?? false),
				],
			],
		]);
	}
}

