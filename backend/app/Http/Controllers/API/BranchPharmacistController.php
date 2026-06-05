<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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
}
