<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BorrowingController;
use App\Http\Controllers\Api\CupboardController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\PlaceController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('cupboards', CupboardController::class);
    Route::apiResource('places', PlaceController::class);
    Route::apiResource('items', ItemController::class);
    Route::post('/items/{item}/quantity', [ItemController::class, 'adjustQuantity']);
    Route::patch('/items/{item}/status', [ItemController::class, 'updateStatus']);

    Route::get('/borrowings', [BorrowingController::class, 'index']);
    Route::post('/borrowings', [BorrowingController::class, 'store']);
    Route::post('/borrowings/{borrowing}/return', [BorrowingController::class, 'returnItem']);

    Route::middleware('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);

        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });
});
