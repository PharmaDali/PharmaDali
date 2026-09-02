<?php

namespace App\Services\User;

use App\Models\User;
use App\Services\Auth\AdminRegisterService;
use App\Services\Auth\CustomerRegisterService;
use App\Services\Auth\PharmacistRegisterService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserService
{
    use ApiResponseTrait;

    public function __construct(
        private PharmacistRegisterService $pharmacistRegisterService,
        private AdminRegisterService $adminRegisterService,
        private CustomerRegisterService $customerRegisterService
    ) {}

    public function index(): JsonResponse
    {
        $users = User::with('pharmacy')->orderBy('id', 'desc')->get();
        return $this->successResponse($users, 'Users retrieved successfully');
    }

    public function store(array $validated, User $creator): JsonResponse
    {
        $validated['password'] = Str::password(12);
        $validated['requires_password_change'] = true;

        if ($validated['role'] === 'pharmacist') {
            $response = $this->pharmacistRegisterService->handle($validated, $creator);
            $user = $response->getData()->user ?? null;
            return $this->successResponse($user, 'Pharmacist created successfully', 201);
        } elseif ($validated['role'] === 'customer') {
            $response = $this->customerRegisterService->handle($validated);
            $user = $response->getData()->user ?? null;
            return $this->successResponse($user, 'Customer created successfully', 201);
        } else {
            $response = $this->adminRegisterService->handle($validated);
            $user = $response->getData()->user ?? null;
            return $this->successResponse($user, 'Admin created successfully', 201);
        }
    }

    public function update(array $validated, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        if ($user->role === 'pharmacist' && !$user->pharmacist) {
            $user->pharmacist()->create([
                'employee_number' => 'PHAR-' . $user->id . '-' . ($user->pharmacy_id ?? '0'),
                'license_number' => (string)rand(10000, 99999),
                'permissions' => ['access_pos', 'access_pickup'],
                'requires_password_change' => false
            ]);
        }

        $user->load('pharmacy');
        return $this->successResponse($user, 'User updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();
        return $this->successResponse(null, 'User deleted successfully');
    }
}
