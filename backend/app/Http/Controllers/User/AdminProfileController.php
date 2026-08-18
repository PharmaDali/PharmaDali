<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\UserProfile\DisplayAdminProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProfileController extends Controller
{
    public function __construct(
        private readonly DisplayAdminProfile $displayAdminProfile,
    ) {}

    public function show(Request $request): JsonResponse
    {
        return $this->displayAdminProfile->handle($request->user());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name'    => 'sometimes|string|max:100',
            'last_name'     => 'sometimes|string|max:100',
            'mobile_number' => 'sometimes|string|max:20',
        ]);

        $request->user()->update($validated);

        return response()->json([
            'message' => 'Profile updated',
            'data'    => $request->user()->fresh(),
        ]);
    }
}
