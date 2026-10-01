<?php

namespace App\Http\Controllers\Pharmacist;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacist\UpdatePharmacistProfileRequest;
use App\Models\User;
use App\Services\UserProfile\DisplayPharmacistProfile;
use Illuminate\Http\JsonResponse;

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
}
