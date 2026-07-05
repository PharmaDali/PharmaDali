<?php

namespace App\Services\UserProfile;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class DisplayAdminProfile
{
    public function handle(?User $admin): JsonResponse
    {
        if (!$admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Admin profile not found.',
            ], 404);
        }

        if ($admin->role !== 'pharmacy_admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pharmacy admins can view this profile.',
            ], 403);
        }

        $admin->load('pharmacy:id,pharmacy_name,location,created_at');

        return response()->json([
            'status' => 'success',
            'data' => [
                'id'             => $admin->id,
                'first_name'     => $admin->first_name,
                'last_name'      => $admin->last_name,
                'email'          => $admin->email,
                'mobile_number'  => $admin->mobile_number,
                'role'           => $admin->role,
                'created_at'     => $admin->created_at,
                'pharmacy'       => [
                    'id'            => $admin->pharmacy?->id,
                    'pharmacy_name' => $admin->pharmacy?->pharmacy_name,
                    'location'      => $admin->pharmacy?->location,
                    'created_at'    => $admin->pharmacy?->created_at,
                ],
            ],
        ]);
    }
}
