<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SearchController;

/*
|--------------------------------------------------------------------------
| Search Routes - Public Access
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1/search')->group(function () {
    Route::get('/trending', [SearchController::class, 'trending']);
    Route::get('/suggestions', [SearchController::class, 'suggestions']);
    Route::post('/record', [SearchController::class, 'recordSearch']);
});
