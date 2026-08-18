<?php

namespace App\Http\Controllers\Pharmacy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pharmacy\PharmacyRequest;
use App\Models\Pharmacy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PharmacyController extends Controller
{
    use AuthorizesRequests;

    /**
    * Display a listing of the resource.
    */
    public function index()
    {
        $pharmacies = Pharmacy::all();
        return response()->json($pharmacies);
    }

    /**
    * Store a newly created resource in storage.
    */
    public function store(PharmacyRequest $request): JsonResponse
    {
        $pharmacy = Pharmacy::create($request->validated());

        return response()->json([
            'message' => 'Pharmacy created',
            'pharmacy' => $pharmacy,
        ], 201);
    }

    /**
    * Display the specified resource.
    */
    public function show(string $id)
    {
        $pharmacy = Pharmacy::findOrFail($id);
        return response()->json($pharmacy);
    }

    /**
    * Update the specified resource in storage.
    */
    public function update(PharmacyRequest $request, string $id)
    {
        $pharmacy = Pharmacy::findOrFail($id);
        $pharmacy->update($request->validated());

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
        $pharmacy = Pharmacy::findOrFail($request->user()->pharmacy_id);

        $validated = $request->validate([
            'pharmacy_name' => 'sometimes|string|max:255',
            'location'      => 'sometimes|string|max:255',
        ]);

        $pharmacy->update($validated);

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

        $pharmacy->delete();

        return response()->noContent();
    }
}
