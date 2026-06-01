<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FcmTokenController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $request->user()->update([
            'fcm_token' => $request->fcm_token,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'FCM token updated successfully',
        ]);
    }

    public function remove(Request $request): JsonResponse
    {
        $request->user()->update([
            'fcm_token' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'FCM token removed successfully',
        ]);
    }
}
