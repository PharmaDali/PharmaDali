<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\UpdatePharmacistPermissionsRequest;
use App\Http\Requests\Pharmacy\UpdatePharmacistRequest;
use App\Services\Pharmacist\PharmacistService;
use Illuminate\Http\JsonResponse;

class PharmacyPharmacistController extends Controller
{
    public function __construct(
        private readonly PharmacistService $pharmacistService
    ) {}

    public function index(): JsonResponse
    {
        $pharmacists = $this->pharmacistService->getPharmacists(request()->user());

        return $this->successResponse($pharmacists, 'Pharmacists fetched successfully.');
    }

    public function update(UpdatePharmacistRequest $request, int $pharmacist): JsonResponse
    {
        $user = $this->pharmacistService->updatePharmacist(
            $request->user(),
            $pharmacist,
            $request->validated()
        );

        return $this->successResponse($user, 'Pharmacist details updated successfully.');
    }

    /**
     * Update permissions for a specific pharmacist profile.
     */
    public function updatePermissions(UpdatePharmacistPermissionsRequest $request, int $pharmacist): JsonResponse
    {
        $user = $this->pharmacistService->updatePermissions(
            $request->user(),
            $pharmacist,
            $request->validated()['permissions']
        );

        return $this->successResponse(
            $user,
            'Pharmacist permissions updated successfully.'
        );
    }

    public function destroy(int $pharmacist): JsonResponse
    {
        $this->pharmacistService->deletePharmacist(request()->user(), $pharmacist);

        return $this->successResponse(null, 'Pharmacist deleted successfully.');
    }
}


