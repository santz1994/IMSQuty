<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Manufacturer Model (Stub for Asset Service)
 * 
 * In production, this data comes from Master Data Service.
 * This stub exists for testing and relationships.
 */
class Manufacturer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'manufacturers';
    protected $connection = 'mysql';

    protected $fillable = [
        'name',
        'country',
        'contact_email',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
