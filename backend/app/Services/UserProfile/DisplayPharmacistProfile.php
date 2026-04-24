<?php

namespace App\Services\UserProfile;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class DisplayPharmacistProfile
{
	public function handle(?User $user): JsonResponse
	{
		if (!$user) {
			return response()->json([
				'status' => 'error',
				'message' => 'Unauthenticated.',
			], 401);
		}

		if ($user->role !== 'pharmacist') {
			return response()->json([
				'status' => 'error',
				'message' => 'Only pharmacists can view this profile.',
			], 403);
		}

		$user->load([
			'pharmacist:id,user_id,employee_number,license_number',
			'branch:id,branch_name,location',
		]);

		if (!$user->pharmacist) {
			return response()->json([
				'status' => 'error',
				'message' => 'Pharmacist profile not found.',
			], 404);
		}

		return response()->json([
			'status' => 'success',
			'data' => $user,
		]);
	}
}

