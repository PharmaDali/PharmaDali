<?php

use App\Http\Controllers\API\BranchController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BranchProductController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('pharmacist/login', [AuthController::class, 'pharmacistLogin']);
Route::post('admin/login', [AuthController::class, 'adminLogin']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'userInfo']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('abilities:customer,pharmacist,branch_admin,super_admin')->group(function () {
        Route::get('branches', [BranchController::class, 'index']);
        Route::get('branches/{id}', [BranchController::class, 'show']);

        Route::get('products', [BranchProductController::class, 'index']);
        Route::get('products/{id}', [BranchProductController::class, 'show']);
        Route::get('branches/{branchId}/products', [BranchProductController::class, 'showBranchProducts']);
    });

    Route::middleware('ability:customer')->group(function () {
        Route::apiResource('posts', PostController::class);
        Route::get('customer/dashboard', function () {
            return response()->json(['message' => 'Customer dashboard access granted']);
        });
    });

    Route::middleware('ability:pharmacist')->group(function () {
        Route::get('pharmacist/dashboard', function () {
            return response()->json(['message' => 'Pharmacist dashboard access granted']);
        });

        Route::get('pharmacist/profile', function (Request $request) {
            return response()->json($request->user()->load('pharmacist'));
        });
    });

    Route::middleware(['ability:branch_admin'])->group(function () {
        Route::get(
            'branch/dashboard',
            fn() =>
            response()->json(['message' => 'Branch Admin dashboard'])
        );

        Route::post('products', [BranchProductController::class, 'store']);
        Route::put('products/{id}', [BranchProductController::class, 'update']);
        Route::delete('products/{id}', [BranchProductController::class, 'destroy']);
    });

    Route::middleware(['ability:super_admin'])->group(function () {
        Route::get(
            'admin/dashboard',
            fn() =>
            response()->json(['message' => 'Super Admin dashboard'])
        );

        Route::apiResource('branches', BranchController::class)->except(['index', 'show']);
    });
});