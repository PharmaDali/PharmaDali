<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
}
