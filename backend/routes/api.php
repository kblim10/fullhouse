<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\HouseController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DashboardController;

// Auth
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Penghuni
    Route::apiResource('residents', ResidentController::class);

    // Rumah
    Route::apiResource('houses', HouseController::class);
    Route::post('/houses/{id}/assign-resident', [HouseController::class, 'assignResident']);
    Route::post('/houses/{id}/remove-resident', [HouseController::class, 'removeResident']);
    Route::get('/houses/{id}/resident-history', [HouseController::class, 'residentHistory']);
    Route::get('/houses/{id}/payment-history', [HouseController::class, 'paymentHistory']);

    // Pembayaran
    Route::apiResource('payments', PaymentController::class);
    Route::post('/payments-bulk', [PaymentController::class, 'storeBulk']);
    Route::post('/payments-generate', [PaymentController::class, 'generateMonthly']);

    // Pengeluaran
    Route::apiResource('expenses', ExpenseController::class);

    // Laporan
    Route::get('/reports/year-summary', [ReportController::class, 'yearSummary']);
    Route::get('/reports/month-detail', [ReportController::class, 'monthDetail']);
    Route::get('/reports/payment-status', [ReportController::class, 'paymentStatus']);
});
