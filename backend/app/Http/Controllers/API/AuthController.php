<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Pharmacist;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:255'],
            'role' => ['sometimes', Rule::in(['customer', 'pharmacist', 'admin'])],
            'employee_number' => ['required_if:role,pharmacist', 'nullable', 'string', 'max:255', 'unique:pharmacists,employee_number'],
            'license_number' => ['required_if:role,pharmacist', 'nullable', 'string', 'max:255', 'unique:pharmacists,license_number'],
        ]);

        $role = $validated['role'] ?? 'customer';

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'mobile_number' => $validated['mobile_number'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'address' => $validated['address'] ?? null,
            'role' => $role,
        ]);

        if ($role === 'pharmacist') {
            $user->pharmacist()->create([
                'employee_number' => $validated['employee_number'],
                'license_number' => $validated['license_number'],
            ]);
        }

        $token = $user->createToken('API Token', $this->tokenAbilitiesForRole($role))->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'token' => $token,
            'token_type' => 'Bearer',
            'role' => $role,
            'user' => $user->load('pharmacist'),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email', 'required_without:employee_number'],
            'employee_number' => ['nullable', 'string', 'required_without:email'],
            'password' => ['required', 'string'],
        ]);

        if (!empty($validated['employee_number'])) {
            $pharmacist = Pharmacist::query()
                ->where('employee_number', $validated['employee_number'])
                ->with('user')
                ->first();

            if (!$pharmacist || !$pharmacist->user || !Hash::check($validated['password'], $pharmacist->user->password)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            /** @var User $user */
            $user = $pharmacist->user;
        } else {
            if (!Auth::attempt([
                'email' => $validated['email'],
                'password' => $validated['password'],
            ])) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            /** @var User $user */
            $user = Auth::user();

            if ($user->role === 'pharmacist') {
                return response()->json([
                    'message' => 'Pharmacist accounts must login using employee_number and password.',
                ], 422);
            }
        }

        $user->tokens()->delete();

        $token = $user->createToken('API Token', $this->tokenAbilitiesForRole($user->role))->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'role' => $user->role,
            'user' => $user->load('pharmacist'),
        ]);
    }

    public function userInfo(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json($user->load('pharmacist'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    private function tokenAbilitiesForRole(string $role): array
    {
        return match ($role) {
            'pharmacist' => ['pharmacist'],
            'customer' => ['customer'],
            default => [],
        };
    }
}
