<?php

namespace App\Http\Controllers\Pharmacist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacist\UpdatePharmacistProfileRequest;
use App\Models\User;
use App\Services\UserProfile\DisplayPharmacistProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PharmacistProfileController extends Controller
{
    public function __construct(
        private readonly DisplayPharmacistProfile $displayPharmacistProfile,
    ) {}

    public function show(): JsonResponse
    {
        return $this->displayPharmacistProfile->handle(request()->user()?->pharmacist);
    }

    public function update(UpdatePharmacistProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->safe()->except(['email', 'employee_number', 'license_number']);

        $user->update($validated);

        return $this->displayPharmacistProfile->handle($user->pharmacist);
    }

    public function updateDutyStatus(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'is_on_duty' => 'required|boolean',
        ]);

        $pharmacist = $user?->pharmacist;
        if (!$pharmacist) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pharmacist profile not found.',
            ], 404);
        }

        $user->loadMissing('pharmacy');
        $isPharmacyOpen = (bool) ($user->pharmacy?->isCurrentlyOpen() ?? false);

        if ((bool) $validated['is_on_duty'] && !$isPharmacyOpen) {
            if ($pharmacist->is_on_duty) {
                $pharmacist->update([
                    'is_on_duty'      => false,
                    'duty_updated_at' => now(),
                ]);
            }

            return response()->json([
                'status'  => 'error',
                'message' => 'Cannot go in duty while the pharmacy is closed.',
            ], 422);
        }

        $pharmacist->update([
            'is_on_duty'      => (bool) $validated['is_on_duty'],
            'duty_updated_at' => now(),
        ]);

        return $this->displayPharmacistProfile->handle($pharmacist->fresh());
    }
}
