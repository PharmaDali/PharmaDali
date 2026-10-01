<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateCustomerProfileRequest;
use App\Models\User;
use App\Services\UserProfile\DisplayCustomerProfile;
use Illuminate\Http\JsonResponse;

class CustomerProfileController extends Controller
{
    public function __construct(
        private readonly DisplayCustomerProfile $displayCustomerProfile,
    ) {}

    public function show(): JsonResponse
    {
        return $this->displayCustomerProfile->handle(request()->user()?->customer);
    }

    public function update(UpdateCustomerProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->safe()->except(['email']);

        $user->update($validated);

        return $this->displayCustomerProfile->handle($user->customer);
    }
}
