<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\UpdatePharmacySettingsRequest;
use App\Services\Pharmacy\PharmacySettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class PharmacySettingsController extends Controller
{
    public function __construct(
        private readonly PharmacySettingsService $settingsService,
    ) {}

    /**
     * GET /pharmacy/settings
     * Return the current pharmacy profile, operating hours, and alert thresholds.
     */
    public function show(Request $request): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $cacheKey = "pharmacy_{$pharmacyId}_settings";

        $settings = Cache::remember($cacheKey, 3600, function () use ($request) {
            return $this->settingsService->getSettings($request->user());
        });

        return response()->json([
            'status' => 'success',
            'data'   => $settings,
        ]);
    }

    /**
     * PUT /pharmacy/settings
     * Update pharmacy profile, operating hours, and/or alert thresholds.
     */
    public function update(UpdatePharmacySettingsRequest $request): JsonResponse
    {
        $pharmacy = $this->settingsService->updateSettings($request->user(), $request->validated());

        $pharmacyId = $request->user()->pharmacy_id;
        Cache::forget("pharmacy_{$pharmacyId}_settings");

        return response()->json([
            'status'  => 'success',
            'message' => 'Settings updated successfully.',
            'data'    => [
                'pharmacy_name' => $pharmacy->pharmacy_name,
                'location'      => $pharmacy->location,
            ],
        ]);
    }

    /**
     * POST /pharmacy/settings/logo
     * Upload a new pharmacy logo image.
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ], [
            'logo.required' => 'Please select a logo image to upload.',
            'logo.image'    => 'The file must be an image (JPEG, PNG, JPG, or WebP).',
            'logo.max'      => 'The logo image must be smaller than 2MB.',
        ]);

        $logoUrl = $this->settingsService->uploadLogo($request->user(), $request->file('logo'));

        $pharmacyId = $request->user()->pharmacy_id;
        Cache::forget("pharmacy_{$pharmacyId}_settings");

        return response()->json([
            'status'   => 'success',
            'message'  => 'Logo uploaded successfully.',
            'logo_url' => $logoUrl,
        ]);
    }

    /**
     * PATCH /pharmacy/settings/password
     * Change the admin account password after verifying the current one.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ], [
            'new_password.confirmed' => 'The new password and confirmation do not match. Please try again.',
            'new_password.min'       => 'Your new password must be at least 8 characters long.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The current password you entered is incorrect. Please try again.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Your password has been updated successfully.',
        ]);
    }
}
