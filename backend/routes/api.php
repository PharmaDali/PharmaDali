<?php

use App\Http\Controllers\API\BranchController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BranchProductController;
use App\Http\Controllers\API\ConversationController;
use App\Http\Controllers\API\CustomerCartController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\OrderItemPrescription;
use App\Http\Controllers\API\PharmacistProfileController;
use App\Http\Controllers\API\BranchPharmacistController;
use App\Http\Controllers\API\CustomerProfileController;
use App\Http\Controllers\API\FcmTokenController;
use App\Http\Controllers\API\ForecastController;
use App\Http\Controllers\API\ForecastInsightController;
use App\Http\Controllers\API\ForecastSyncController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\PosController;
use App\Http\Controllers\API\InventoryController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('customer/register', [AuthController::class, 'customerRegister']);
Route::post('login', [AuthController::class, 'login']);
Route::post('pharmacist/login', [AuthController::class, 'pharmacistLogin']);
Route::post('admin/login', [AuthController::class, 'adminLogin']);

Broadcast::routes(['middleware' => ['auth:sanctum']]);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'userInfo']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread', [NotificationController::class, 'unread']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);

    // FCM Token
    Route::post('fcm-token', [FcmTokenController::class, 'update']);
    Route::delete('fcm-token', [FcmTokenController::class, 'remove']);

    Route::get('branches', [BranchController::class, 'index']);
    Route::get('branches/{id}', [BranchController::class, 'show']);

    Route::get('products', [BranchProductController::class, 'index']);
    Route::get('products/{id}', [BranchProductController::class, 'show']);
    Route::get('branches/{branchId}/products', [BranchProductController::class, 'showBranchProducts']);
    Route::get('branches/{branchId}/products/{branchProductId}', [BranchProductController::class, 'showSingleBranchProduct']);
    Route::get('branches/{branchId}/categories', [BranchProductController::class, 'showBranchCategories']);

    Route::middleware('ability:pharmacist,branch_admin')->group(function () {
        Route::get('branch/forecasts', [ForecastController::class, 'index']);
    });

    Route::middleware('ability:customer')->group(function () {
        Route::get('customer/dashboard', function () {
            return response()->json(['message' => 'Customer dashboard access granted']);
        });

        Route::get('customer/messages/pharmacists', [ConversationController::class, 'customerPharmacists']);
        Route::get('customer/messages/conversations', [ConversationController::class, 'index']);
        Route::post('customer/messages/conversations', [ConversationController::class, 'store']);
        Route::get('customer/messages/conversations/{conversation}', [ConversationController::class, 'show']);
        Route::post('customer/messages/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);

        Route::get('customer/profile', [CustomerProfileController::class, 'show']);

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

        Route::get('pharmacist/messages/customers', [ConversationController::class, 'pharmacistCustomers']);
        Route::get('pharmacist/messages/conversations', [ConversationController::class, 'index']);
        Route::post('pharmacist/messages/conversations', [ConversationController::class, 'store']);
        Route::get('pharmacist/messages/conversations/{conversation}', [ConversationController::class, 'show']);
        Route::post('pharmacist/messages/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);

        Route::get('pos/products', [PosController::class, 'getProducts']);
        Route::post('pos/orders', [PosController::class, 'storeOrder']);

        Route::get('pharmacist/profile', [PharmacistProfileController::class, 'show']);

        Route::get('pharmacist/orders', [OrderController::class, 'index']);
        Route::get('pharmacist/orders/{order}', [OrderController::class, 'show']);
        Route::patch('pharmacist/orders/{order}/status', [OrderController::class, 'updateStatusByPharmacist']);

    });

    Route::middleware(['ability:branch_admin'])->group(function () {
        Route::get(
            'branch/dashboard',
            fn() =>
            response()->json(['message' => 'Branch Admin dashboard'])
        );

        Route::get('pos/products', [PosController::class, 'getProducts']);
        Route::post('pos/orders', [PosController::class, 'storeOrder']);
        Route::get('pos/pickup-orders', [PosController::class, 'getPickupOrders']);
        Route::patch('pos/pickup-orders/{order}/complete', [PosController::class, 'completePickupOrder']);

        Route::post('pharmacist/register', [AuthController::class, 'pharmacistRegister']);
        Route::get('pharmacists', [BranchPharmacistController::class, 'index']);
        Route::put('pharmacists/{pharmacist}', [BranchPharmacistController::class, 'update']);
        Route::delete('pharmacists/{pharmacist}', [BranchPharmacistController::class, 'destroy']);

        Route::post('branch/forecasts/sync', [ForecastSyncController::class, 'sync']);
        Route::get('branch/forecast-insights', [ForecastInsightController::class, 'show']);

        Route::post('products', [BranchProductController::class, 'store']);
        Route::post('products/import', [BranchProductController::class, 'importBranchProducts']);
        Route::put('products/{id}', [BranchProductController::class, 'update']);
        Route::delete('products/{id}', [BranchProductController::class, 'destroy']);

        Route::get('branch/orders/count', [OrderController::class, 'countTotalOrders']);
        Route::get('branch/orders/stats', [OrderController::class, 'getTodayStats']);
        Route::get('branch/orders', [OrderController::class, 'index']);
        Route::get('branch/orders/{order}', [OrderController::class, 'show']);

        // inventory
        Route::get('branch/inventory/total-products', [InventoryController::class, 'getTotalProductCount']);
        Route::get('branch/inventory/metrics', [InventoryController::class, 'getInventoryMetrics']);
        Route::get('branch/inventory/products', [InventoryController::class, 'getInventoryProducts']);
        Route::get('branch/inventory/logs', [InventoryController::class, 'getInventoryLogs']);
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