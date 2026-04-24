<?php

namespace App\Services\UserProfile;

use App\Models\Customer;
use Illuminate\Http\JsonResponse;

class DisplayCustomerProfile
{
    public function handle(?Customer $customer): JsonResponse
    {
        if (!$customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 404);
        }

        $customer->load([
            'user:id,first_name,last_name,email,role,branch_id,mobile_number,address,date_of_birth',
            'user.branch:id,branch_name,location',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $customer->id,
                'user' => [
                    'id' => $customer->user?->id,
                    'first_name' => $customer->user?->first_name,
                    'last_name' => $customer->user?->last_name,
                    'email' => $customer->user?->email,
                    'role' => $customer->user?->role,
                    'mobile_number' => $customer->user?->mobile_number,
                    'address' => $customer->user?->address,
                    'date_of_birth' => $customer->user?->date_of_birth,
                ]
            ],
        ]);
    }
}