<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePharmacistRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class BranchPharmacistController extends Controller
{
    public function index(): JsonResponse
    {
        /** @var User $admin */
        $admin = request()->user();

        $pharmacists = User::where('branch_id', $admin->branch_id)
            ->where('role', 'pharmacist')
            ->with('pharmacist')
            ->get();

        return response()->json($pharmacists);
    }

    public function update(UpdatePharmacistRequest $request, int $pharmacist): JsonResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        $user = User::where('id', $pharmacist)
            ->where('branch_id', $admin->branch_id)
            ->where('role', 'pharmacist')
            ->firstOrFail();

        $data = $request->validated();

        $user->fill(array_filter([
            'first_name'    => $data['first_name'] ?? null,
            'last_name'     => $data['last_name'] ?? null,
            'email'         => $data['email'] ?? null,
            'mobile_number' => $data['mobile_number'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'address'       => $data['address'] ?? null,
            'is_active'     => $data['is_active'] ?? null,
        ], fn ($value) => !is_null($value)));

        $user->save();

        if (array_key_exists('license_number', $data)) {
            $user->pharmacist()->update([
                'license_number' => $data['license_number'],
            ]);
        }

        return response()->json($user->load('pharmacist'));
    }

    public function destroy(int $pharmacist): JsonResponse
    {
        /** @var User $admin */
        $admin = request()->user();

        $user = User::where('id', $pharmacist)
            ->where('branch_id', $admin->branch_id)
            ->where('role', 'pharmacist')
            ->firstOrFail();

        $user->delete();

        return response()->json(['message' => 'Pharmacist deleted successfully.']);
    }
}
