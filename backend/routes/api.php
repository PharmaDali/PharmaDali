<?php

use App\Http\Controllers\Analytics\AnalyticsController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\CustomerChangePasswordController;
use App\Http\Controllers\Auth\CustomerForgotPasswordController;
use App\Http\Controllers\Auth\PharmacistChangePasswordController;
use App\Http\Controllers\Customer\CustomerCartController;
use App\Http\Controllers\Customer\CustomerProfileController;
use App\Http\Controllers\Customer\CustomerRecommendationController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Discount\DiscountController;
use App\Http\Controllers\Inventory\CategoryController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Inventory\ProductBatchController;
use App\Http\Controllers\Notification\ConversationController;
use App\Http\Controllers\Notification\FcmTokenController;
use App\Http\Controllers\Notification\NotificationController;
use App\Http\Controllers\Order\DiscountIdUploadController;
use App\Http\Controllers\Order\OrderController;
use App\Http\Controllers\Order\OrderItemPrescriptionController;
use App\Http\Controllers\Order\PaymentReceiptUploadController;
use App\Http\Controllers\Pharmacist\PharmacistProfileController;
use App\Http\Controllers\Pharmacy\PharmacyController;
use App\Http\Controllers\Pharmacy\PharmacyPharmacistController;
use App\Http\Controllers\Pharmacy\PharmacyProductController;
use App\Http\Controllers\Pharmacy\PharmacySettingsController;
use App\Http\Controllers\Pos\ItemExchangeController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Report\ReportController;
use App\Http\Controllers\User\AdminProfileController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;


// Public routes
Route::post('customer/register', [AuthController::class, 'customerRegister'])->middleware('throttle:auth-register');
Route::post('login', [AuthController::class, 'login']);
Route::post('pharmacist/login', [AuthController::class, 'pharmacistLogin']);
Route::post('admin/login', [AuthController::class, 'adminLogin']);

// Customer Forgot Password routes (Email OTP stored in Redis)
Route::post('customer/forgot-password/send-otp', [CustomerForgotPasswordController::class, 'sendOtp']);
Route::post('customer/forgot-password/verify-otp', [CustomerForgotPasswordController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
Route::post('customer/forgot-password/reset-password', [CustomerForgotPasswordController::class, 'resetPassword']);

// Customer Change Password routes (Email OTP stored in Redis)
Route::post('customer/change-password/send-otp', [CustomerChangePasswordController::class, 'sendOtp']);
Route::post('customer/change-password/verify-otp', [CustomerChangePasswordController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
Route::post('customer/change-password/reset-password', [CustomerChangePasswordController::class, 'changePassword']);

// Pharmacist Change Password routes (Email OTP stored in Redis)
Route::post('pharmacist/change-password/send-otp', [PharmacistChangePasswordController::class, 'sendOtp']);
Route::post('pharmacist/change-password/verify-otp', [PharmacistChangePasswordController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
Route::post('pharmacist/change-password/reset-password', [PharmacistChangePasswordController::class, 'changePassword']);

Broadcast::routes(['middleware' => ['auth:sanctum']]);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'userInfo']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread', [NotificationController::class, 'unread']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/delete-all', [NotificationController::class, 'deleteAll']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);

    // FCM Token
    Route::post('fcm-token', [FcmTokenController::class, 'update']);
    Route::delete('fcm-token', [FcmTokenController::class, 'remove']);

    Route::get('pharmacies', [PharmacyController::class, 'index']);
    Route::get('pharmacies/{id}', [PharmacyController::class, 'show']);

    //products
    Route::get('products', [PharmacyProductController::class, 'index']);
    Route::get('products/{id}', [PharmacyProductController::class, 'show']);
    Route::get('pharmacies/{pharmacyId}/products', [PharmacyProductController::class, 'showPharmacyProducts']);
    Route::get('pharmacies/{pharmacyId}/products/{pharmacyProductId}', [PharmacyProductController::class, 'showSinglePharmacyProduct']);
    Route::get('pharmacies/{pharmacyId}/categories', [PharmacyProductController::class, 'showPharmacyCategories']);

    Route::middleware('ability:customer')->group(function () {
        // chats
        Route::get('customer/messages/pharmacists', [ConversationController::class, 'customerPharmacists']);
        Route::get('customer/messages/conversations', [ConversationController::class, 'index']);
        Route::post('customer/messages/conversations', [ConversationController::class, 'store']);
        Route::get('customer/messages/conversations/{conversation}', [ConversationController::class, 'show']);
        Route::post('customer/messages/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);

        // Profile
        Route::get('customer/profile', [CustomerProfileController::class, 'show']);
        Route::get('customer/recommendations/hero', [CustomerRecommendationController::class, 'hero']);

        // Cart
        Route::post('customer/cart/items', [CustomerCartController::class, 'addItem']);
        Route::get('customer/cart/items', [CustomerCartController::class, 'viewCart']);
        Route::delete('customer/cart/items', [CustomerCartController::class, 'clearCart']);
        Route::delete('customer/cart/items/{cartItemId}', [CustomerCartController::class, 'removeItem']);
        Route::get('customer/cart/items/count', [CustomerCartController::class, 'countCartItems']);

        // Order
        Route::post('customer/orders', [OrderController::class, 'store']);
        Route::get('customer/orders', [OrderController::class, 'index']);
        Route::get('customer/orders/{order}', [OrderController::class, 'show']);
        Route::get('customer/orders/{order}/review', [OrderController::class, 'review']);
        Route::put('customer/orders/{order}', [OrderController::class, 'update']);
        Route::patch('customer/orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::post('customer/order-items/{orderItem}/prescription', [OrderItemPrescriptionController::class, 'upload'])->middleware('throttle:file-upload');
        Route::post('customer/orders/{order}/discount-id', [DiscountIdUploadController::class, 'upload'])->middleware('throttle:discount-id-upload');
        Route::post('customer/orders/{order}/payment-receipt', [PaymentReceiptUploadController::class, 'upload'])->middleware('throttle:payment-receipt-upload');
        Route::post('customer/orders/{order}/confirm-instore-payment', [OrderController::class, 'confirmInStorePayment']);
        Route::post('customer/orders/{order}/acknowledge-discount', [OrderController::class, 'acknowledgeDiscount']);
        Route::post('customer/orders/{order}/remove-rx-items', [OrderController::class, 'removeRxItems']);
    });

    Route::middleware(['ability:pharmacist,pharmacy_admin'])->group(function () {

        Route::get('pharmacist/messages/customers', [ConversationController::class, 'pharmacistCustomers']);
        Route::get('pharmacist/messages/conversations', [ConversationController::class, 'index']);
        Route::post('pharmacist/messages/conversations', [ConversationController::class, 'store']);
        Route::get('pharmacist/messages/conversations/{conversation}', [ConversationController::class, 'show']);
        Route::post('pharmacist/messages/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);

        Route::get('pos/products', [PosController::class, 'getProducts']);
        Route::post('pos/orders', [PosController::class, 'storeOrder']);
        Route::get('pos/orders/{order}/receipt', [PosController::class, 'getReceipt']);

        Route::get('pharmacist/profile', [PharmacistProfileController::class, 'show']);

        Route::get('pharmacist/orders', [OrderController::class, 'index']);
        Route::get('pharmacist/orders/{order}', [OrderController::class, 'show']);
        Route::patch('pharmacist/orders/{order}/status', [OrderController::class, 'updateStatusByPharmacist']);

    });

    Route::middleware(['ability:pharmacy_admin,pharmacist,super_admin,admin,system_admin'])->group(function () {
        Route::get('pharmacy/dashboard/overview', [DashboardController::class, 'overview']);
        Route::get('pharmacy/dashboard/sales-trend', [DashboardController::class, 'salesTrend']);

        Route::get('admin/profile', [AdminProfileController::class, 'show']);
        Route::patch('admin/profile', [AdminProfileController::class, 'update']);
        Route::patch('admin/pharmacy', [PharmacyController::class, 'updateOwn']);

        // Pharmacy settings (store profile, operating hours, alert thresholds, account security)
        Route::get('pharmacy/settings', [PharmacySettingsController::class, 'show']);
        Route::put('pharmacy/settings', [PharmacySettingsController::class, 'update']);
        Route::post('pharmacy/settings/logo', [PharmacySettingsController::class, 'uploadLogo'])->middleware('throttle:file-upload');
        Route::patch('pharmacy/settings/password', [PharmacySettingsController::class, 'updatePassword']);

        // Category settings CRUD
        Route::get('pharmacy/categories/all', [CategoryController::class, 'index']);
        Route::post('pharmacy/categories/store', [CategoryController::class, 'store']);
        Route::put('pharmacy/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('pharmacy/categories/{id}', [CategoryController::class, 'destroy']);

        // Discount settings CRUD
        Route::get('pharmacy/discounts', [DiscountController::class, 'index']);
        Route::post('pharmacy/discounts', [DiscountController::class, 'store']);
        Route::put('pharmacy/discounts/{id}', [DiscountController::class, 'update']);
        Route::delete('pharmacy/discounts/{id}', [DiscountController::class, 'destroy']);

        Route::get('pos/products', [PosController::class, 'getProducts']);
        Route::post('pos/orders', [PosController::class, 'storeOrder']);
        Route::get('pos/pickup-orders', [PosController::class, 'getPickupOrders']);
        Route::patch('pos/pickup-orders/{order}/complete', [PosController::class, 'completePickupOrder']);
        Route::get('pos/exchanges', [ItemExchangeController::class, 'index']);
        Route::get('pos/orders/{order}/exchange-eligibility', [ItemExchangeController::class, 'eligibility']);
        Route::post('pos/exchanges', [ItemExchangeController::class, 'store']);
        Route::get('pos/exchanges/{id}', [ItemExchangeController::class, 'show']);

        Route::post('pharmacist/register', [AuthController::class, 'pharmacistRegister'])->middleware('throttle:auth-register');
        Route::get('pharmacists', [PharmacyPharmacistController::class, 'index']);
        Route::put('pharmacists/{pharmacist}', [PharmacyPharmacistController::class, 'update']);
        Route::put('pharmacists/{pharmacist}/permissions', [PharmacyPharmacistController::class, 'updatePermissions']);
        Route::delete('pharmacists/{pharmacist}', [PharmacyPharmacistController::class, 'destroy']);

        Route::post('products', [PharmacyProductController::class, 'store']);
        Route::post('products/import', [PharmacyProductController::class, 'importPharmacyProducts'])->middleware('throttle:batch-import');
        Route::put('products/{id}', [PharmacyProductController::class, 'update']);
        Route::patch('products/{id}/mark-ordered', [PharmacyProductController::class, 'markOrdered']);
        Route::delete('products/{id}', [PharmacyProductController::class, 'destroy']);
        Route::post('products/{id}/image', [PharmacyProductController::class, 'uploadImage'])->middleware('throttle:file-upload');


        Route::get('pharmacy/orders/stats', [OrderController::class, 'getTodayStats']);
        Route::get('pharmacy/orders', [OrderController::class, 'index']);
        Route::get('pharmacy/orders/{order}', [OrderController::class, 'show']);

        // inventory
        Route::get('pharmacy/inventory/metrics', [InventoryController::class, 'getInventoryMetrics']);
        Route::get('pharmacy/inventory/priority-restocks', [InventoryController::class, 'getPriorityRestocks']);
        Route::get('pharmacy/inventory/products', [InventoryController::class, 'getInventoryProducts']);
        Route::get('pharmacy/inventory/logs', [InventoryController::class, 'getInventoryLogs']);

        // analytics
        Route::get('pharmacy/analytics/sales', [AnalyticsController::class, 'sales']);
        Route::get('pharmacy/analytics/demand', [AnalyticsController::class, 'demand']);
        Route::get('pharmacy/analytics/apriori', [AnalyticsController::class, 'apriori']);
        Route::get('pharmacy/analytics/insights', [AnalyticsController::class, 'insights']);

        // sales and reports
        Route::get('pharmacy/reports/sales/summary', [ReportController::class, 'getSalesSummary']);
        Route::get('pharmacy/reports/sales', [ReportController::class, 'getSalesList']);
        Route::get('pharmacy/reports/sales/export/csv', [ReportController::class, 'exportSalesCsv'])->middleware('throttle:csv-pdf-export');
        Route::get('pharmacy/reports/sales/export/pdf', [ReportController::class, 'exportSalesPdf'])->middleware('throttle:csv-pdf-export');

        // product batches
        Route::get('pharmacy/inventory/products/{pharmacyProductId}/batches', [ProductBatchController::class, 'index']);
        Route::post('pharmacy/inventory/products/{pharmacyProductId}/batches', [ProductBatchController::class, 'store']);
        Route::patch('pharmacy/inventory/batches/{batchId}', [ProductBatchController::class, 'update']);
        Route::post('pharmacy/inventory/products/{pharmacyProductId}/stock-out', [ProductBatchController::class, 'stockOut']);
    });

    Route::middleware(['ability:super_admin'])->group(function () {
        Route::get('admin/dashboard/metrics', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'metrics']);
        Route::post('admin/register', [AuthController::class, 'adminRegister'])->middleware('throttle:auth-register');

        Route::apiResource('pharmacies', PharmacyController::class)->except(['index', 'show']);
    });
});