<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'service' => 'IMSQuty Auth Service',
        'version' => '1.0.0',
        'status' => 'running',
        'documentation' => '/api/documentation'
    ]);
});
