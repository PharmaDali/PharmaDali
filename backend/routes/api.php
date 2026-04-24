<?php

use App\Http\Controllers\API\BranchController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BranchProductController;
use App\Http\Controllers\API\CustomerCartController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\OrderItemPrescription;
use App\Http\Controllers\API\PharmacistProfileController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('customer/register', [AuthController::class, 'customerRegister']);
Route::post('login', [AuthController::class, 'login']);
Route::post('pharmacist/login', [AuthController::class, 'pharmacistLogin']);
Route::post('admin/login', [AuthController::class, 'adminLogin']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'userInfo']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::get('branches', [BranchController::class, 'index']);
    Route::get('branches/{id}', [BranchController::class, 'show']);

    Route::get('products', [BranchProductController::class, 'index']);
    Route::get('products/{id}', [BranchProductController::class, 'show']);
    Route::get('branches/{branchId}/products', [BranchProductController::class, 'showBranchProducts']);
    Route::get('branches/{branchId}/categories', [BranchProductController::class, 'showBranchCategories']);

    Route::middleware('ability:customer')->group(function () {
        Route::get('customer/dashboard', function () {
            return response()->json(['message' => 'Customer dashboard access granted']);
        });

        Route::post('customer/cart/items', [CustomerCartController::class, 'addItem']);
        Route::get('customer/cart/items', [CustomerCartController::class, 'viewCart']);
        Route::get('customer/cart/items/count', [CustomerCartController::class, 'countCartItems']);

        Route::post('customer/orders', [OrderController::class, 'store']);
        Route::get('customer/orders', [OrderController::class, 'index']);
        Route::get('customer/orders/{order}', [OrderController::class, 'show']);
        Route::get('customer/orders/{order}/review', [OrderController::class, 'review']);
        Route::put('customer/orders/{order}', [OrderController::class, 'update']);
        Route::patch('customer/orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::post('customer/order-items/{orderItem}/prescription', [OrderItemPrescription::class, 'upload']);
    });

    Route::middleware('ability:pharmacist')->group(function () {
        Route::get('pharmacist/dashboard', function () {
            return response()->json(['message' => 'Pharmacist dashboard access granted']);
        });

        Route::get('pharmacist/profile', [PharmacistProfileController::class, 'show']);

        Route::get('pharmacist/orders', [OrderController::class, 'index']);
        Route::get('pharmacist/orders/{order}', [OrderController::class, 'show']);
        Route::patch('pharmacist/orders/{order}/reject', [OrderController::class, 'reject']);
        Route::patch('pharmacist/orders/{order}/cancel', [OrderController::class, 'cancelByPharmacist']);
    });

    Route::middleware(['ability:branch_admin'])->group(function () {
        Route::get(
            'branch/dashboard',
            fn() =>
            response()->json(['message' => 'Branch Admin dashboard'])
        );

        Route::post('pharmacist/register', [AuthController::class, 'pharmacistRegister']);

        Route::post('products', [BranchProductController::class, 'store']);
        Route::put('products/{id}', [BranchProductController::class, 'update']);
        Route::delete('products/{id}', [BranchProductController::class, 'destroy']);

        Route::get('branch/orders/count', [OrderController::class, 'countTotalOrders']);
        Route::get('branch/orders', [OrderController::class, 'index']);
        Route::get('branch/orders/{order}', [OrderController::class, 'show']);
    });

    Route::middleware(['ability:super_admin'])->group(function () {
        Route::get(
            'admin/dashboard',
            fn() =>
            response()->json(['message' => 'Super Admin dashboard'])
        );

        Route::post('admin/register', [AuthController::class, 'adminRegister']);

        Route::apiResource('branches', BranchController::class)->except(['index', 'show']);
    });
});