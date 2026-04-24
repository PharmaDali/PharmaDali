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
			'user:id,first_name,last_name,email,role,branch_id,mobile_number,address,date_of_birth',
			'user.branch:id,branch_name,location',
		]);

		if (($pharmacist->user?->role ?? null) !== 'pharmacist') {
			return response()->json([
				'status' => 'error',
				'message' => 'Only pharmacists can view this profile.',
			], 403);
		}

		return response()->json([
			'status' => 'success',
			'data' => [
				'id' => $pharmacist->id,
				'employee_number' => $pharmacist->employee_number,
				'license_number' => $pharmacist->license_number,
				'user' => [
					'id' => $pharmacist->user?->id,
					'first_name' => $pharmacist->user?->first_name,
					'last_name' => $pharmacist->user?->last_name,
					'email' => $pharmacist->user?->email,
					'role' => $pharmacist->user?->role,
					'mobile_number' => $pharmacist->user?->mobile_number,
					'address' => $pharmacist->user?->address,
					'date_of_birth' => $pharmacist->user?->date_of_birth,
				],
				'branch' => [
					'id' => $pharmacist->user?->branch?->id,
					'branch_name' => $pharmacist->user?->branch?->branch_name,
					'location' => $pharmacist->user?->branch?->location,
				],
			],
		]);
	}
}

