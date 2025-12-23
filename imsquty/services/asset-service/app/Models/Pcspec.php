<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Pcspec Model (Stub for Asset Service)
 * 
 * PC Specifications model for asset models.
 * In production, this data comes from Master Data Service.
 */
class Pcspec extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pcspecs';
    protected $connection = 'mysql';

    protected $fillable = [
        'name',
        'processor',
        'memory_gb',
        'storage_gb',
        'storage_type',
        'gpu',
        'display_size',
        'notes',
    ];

    protected $casts = [
        'memory_gb' => 'integer',
        'storage_gb' => 'integer',
        'display_size' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
