<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Division Model
 * Minimal model for asset-service - references shared imsquty.divisions table
 */
class Division extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'divisions';

    protected $fillable = [
        'name',
        'code',
        'description',
        'location_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
