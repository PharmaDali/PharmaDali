<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\PharmacyRequest;
use App\Models\Pharmacy;
use App\Models\User;
use App\Notifications\NewPharmacyAdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PharmacyController extends Controller
{
    use AuthorizesRequests;

    /**
    * Display a listing of the resource.
    */
    public function index()
    {
        $pharmacies = Cache::remember('pharmacies_all', 3600, function () {
            return Pharmacy::with(['admins', 'pharmacists.pharmacist'])->get();
        });

        return response()->json($pharmacies);
    }

    /**
    * Store a newly created resource in storage.
    */
    public function store(PharmacyRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $pharmacy = DB::transaction(function () use ($validated) {
            $pharmacy = Pharmacy::create([
                'pharmacy_name'  => $validated['pharmacy_name'],
                'location'       => $validated['location'],
                'contact_number' => $validated['contact_number'],
                'email'          => $validated['email'] ?? null,
                'is_active'      => $validated['is_active'] ?? true,
            ]);

            if (!empty($validated['admin_email'])) {
                $tempPassword = Str::password(12);

                $admin = User::create([
                    'first_name'               => $validated['admin_first_name'],
                    'last_name'                => $validated['admin_last_name'] ?? null,
                    'email'                    => $validated['admin_email'],
                    'mobile_number'            => $validated['admin_mobile_number'] ?? null,
                    'password'                 => Hash::make($tempPassword),
                    'role'                     => 'pharmacy_admin',
                    'pharmacy_id'              => $pharmacy->id,
                    'is_active'                => true,
                    'requires_password_change' => true,
                ]);

                $admin->notify(new NewPharmacyAdminNotification($tempPassword));
            }

            return $pharmacy;
        });

        Cache::forget('pharmacies_all');

        $pharmacy->load(['admins', 'pharmacists.pharmacist']);

        return response()->json([
            'message'  => 'Pharmacy and admin created successfully',
            'pharmacy' => $pharmacy,
        ], 201);
    }

    /**
    * Display the specified resource.
    */
    public function show(string $id)
    {
        $pharmacy = Cache::remember("pharmacy_{$id}", 3600, function () use ($id) {
            return Pharmacy::findOrFail($id);
        });

        return response()->json($pharmacy);
    }

    /**
    * Update the specified resource in storage.
    */
    public function update(PharmacyRequest $request, string $id)
    {
        $pharmacy = Pharmacy::findOrFail($id);
        $pharmacy->update($request->validated());

        Cache::forget('pharmacies_all');
        Cache::forget("pharmacy_{$id}");

        return response()->json([
            'message' => 'Pharmacy updated',
            'pharmacy' => $pharmacy,
        ]);
    }

    /**
    * Allow a pharmacy_admin to update their own pharmacy's name and location.
    */
    public function updateOwn(Request $request): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $pharmacy = Pharmacy::findOrFail($pharmacyId);

        $validated = $request->validate([
            'pharmacy_name' => 'sometimes|string|max:255',
            'location'      => 'sometimes|string|max:255',
        ]);

        $pharmacy->update($validated);

        Cache::forget('pharmacies_all');
        Cache::forget("pharmacy_{$pharmacyId}");

        return response()->json([
            'message'  => 'Pharmacy updated',
            'pharmacy' => $pharmacy,
        ]);
    }

    /**
    * Remove the specified resource from storage.
    */
    public function destroy(Pharmacy $pharmacy)
    {
        $this->authorize('delete', $pharmacy);

        if ($pharmacy->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete pharmacy with employees'
            ], 400);
        }

        $pharmacyId = $pharmacy->id;
        $pharmacy->delete();

        Cache::forget('pharmacies_all');
        Cache::forget("pharmacy_{$pharmacyId}");

        return response()->noContent();
    }
}
