<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\UserProfile\DisplayPharmacistProfile;
use Illuminate\Http\JsonResponse;

class PharmacistProfileController extends Controller
{
    public function __construct(
        private readonly DisplayPharmacistProfile $displayPharmacistProfile,
    ) {}

    public function show(): JsonResponse
    {
        return $this->displayPharmacistProfile->handle(request()->user());
    }
}
