<?php

use App\Http\Controllers\Download\AppDownloadController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Direct APK Download for Pharmacist Mobile Application
Route::get('/download/pharmacist-app', [AppDownloadController::class, 'downloadPharmacistApp'])->name('download.pharmacist');
Route::get('/downloads/pharmacist-app', [AppDownloadController::class, 'downloadPharmacistApp']);
