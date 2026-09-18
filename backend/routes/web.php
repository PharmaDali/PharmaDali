<?php

use App\Http\Controllers\Download\AppDownloadController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Direct APK Download for Mobile Applications
Route::get('/download/pharmacist-app', [AppDownloadController::class, 'downloadPharmacistApp'])->name('download.pharmacist');
Route::get('/downloads/pharmacist-app', [AppDownloadController::class, 'downloadPharmacistApp']);
Route::get('/download/customer-app', [AppDownloadController::class, 'downloadCustomerApp'])->name('download.customer');
Route::get('/downloads/customer-app', [AppDownloadController::class, 'downloadCustomerApp']);
