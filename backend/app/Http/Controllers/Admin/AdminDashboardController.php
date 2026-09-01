<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function metrics(): JsonResponse
    {
        $totalPharmacies = Pharmacy::count();
        $totalActivePharmacies = Pharmacy::where('is_active', true)->count();
        $totalUsers = User::count();

        return response()->json([
            'status' => 'Success',
            'data' => [
                'total_pharmacies' => $totalPharmacies,
                'total_active_pharmacies' => $totalActivePharmacies,
                'total_users' => $totalUsers,
            ],
            'message' => 'Admin metrics fetched successfully.'
        ]);
    }
}
