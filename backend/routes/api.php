<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\PostController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'userInfo']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::apiResource('posts', PostController::class);
});