<?php

use App\Http\Controllers\API\PharmacyController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\PharmacyProductController;
use App\Http\Controllers\API\ConversationController;
use App\Http\Controllers\API\CustomerCartController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\OrderItemPrescription;
use App\Http\Controllers\API\PharmacistProfileController;
use App\Http\Controllers\API\PharmacyPharmacistController;
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

    Route::get('pharmacies', [PharmacyController::class, 'index']);
    Route::get('pharmacies/{id}', [PharmacyController::class, 'show']);

    Route::get('products', [PharmacyProductController::class, 'index']);
    Route::get('products/{id}', [PharmacyProductController::class, 'show']);
    Route::get('pharmacies/{pharmacyId}/products', [PharmacyProductController::class, 'showPharmacyProducts']);
    Route::get('pharmacies/{pharmacyId}/products/{pharmacyProductId}', [PharmacyProductController::class, 'showSinglePharmacyProduct']);
    Route::get('pharmacies/{pharmacyId}/categories', [PharmacyProductController::class, 'showPharmacyCategories']);

    Route::middleware(['ability:pharmacist,pharmacy_admin'])->group(function () {
        Route::get('pharmacy/forecasts', [ForecastController::class, 'index']);
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

    Route::middleware(['ability:pharmacist,pharmacy_admin'])->group(function () {
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

    Route::middleware(['ability:pharmacy_admin'])->group(function () {
        Route::get(
            'pharmacy/dashboard',
            fn() =>
            response()->json(['message' => 'Pharmacy Admin dashboard'])
        );

        Route::get('pos/products', [PosController::class, 'getProducts']);
        Route::post('pos/orders', [PosController::class, 'storeOrder']);
        Route::get('pos/pickup-orders', [PosController::class, 'getPickupOrders']);
        Route::patch('pos/pickup-orders/{order}/complete', [PosController::class, 'completePickupOrder']);

        Route::post('pharmacist/register', [AuthController::class, 'pharmacistRegister']);
        Route::get('pharmacists', [PharmacyPharmacistController::class, 'index']);
        Route::put('pharmacists/{pharmacist}', [PharmacyPharmacistController::class, 'update']);
        Route::delete('pharmacists/{pharmacist}', [PharmacyPharmacistController::class, 'destroy']);

        Route::post('pharmacy/forecasts/sync', [ForecastSyncController::class, 'sync']);
        Route::get('pharmacy/forecast-insights', [ForecastInsightController::class, 'show']);

        Route::post('products', [PharmacyProductController::class, 'store']);
        Route::post('products/import', [PharmacyProductController::class, 'importPharmacyProducts']);
        Route::put('products/{id}', [PharmacyProductController::class, 'update']);
        Route::delete('products/{id}', [PharmacyProductController::class, 'destroy']);

        Route::get('pharmacy/orders/count', [OrderController::class, 'countTotalOrders']);
        Route::get('pharmacy/orders/stats', [OrderController::class, 'getTodayStats']);
        Route::get('pharmacy/orders', [OrderController::class, 'index']);
        Route::get('pharmacy/orders/{order}', [OrderController::class, 'show']);

        // inventory
        Route::get('pharmacy/inventory/total-products', [InventoryController::class, 'getTotalProductCount']);
        Route::get('pharmacy/inventory/metrics', [InventoryController::class, 'getInventoryMetrics']);
        Route::get('pharmacy/inventory/products', [InventoryController::class, 'getInventoryProducts']);
        Route::get('pharmacy/inventory/logs', [InventoryController::class, 'getInventoryLogs']);

        // product batches
        Route::get('pharmacy/inventory/products/{pharmacyProductId}/batches', [\App\Http\Controllers\API\ProductBatchController::class, 'index']);
        Route::post('pharmacy/inventory/products/{pharmacyProductId}/batches', [\App\Http\Controllers\API\ProductBatchController::class, 'store']);
        Route::patch('pharmacy/inventory/batches/{batchId}', [\App\Http\Controllers\API\ProductBatchController::class, 'update']);
        Route::post('pharmacy/inventory/products/{pharmacyProductId}/stock-out', [\App\Http\Controllers\API\ProductBatchController::class, 'stockOut']);
    });

    Route::middleware(['ability:super_admin'])->group(function () {
        Route::get(
            'admin/dashboard',
            fn() =>
            response()->json(['message' => 'Super Admin dashboard'])
        );

        Route::post('admin/register', [AuthController::class, 'adminRegister']);

        Route::apiResource('pharmacies', PharmacyController::class)->except(['index', 'show']);
    });
});