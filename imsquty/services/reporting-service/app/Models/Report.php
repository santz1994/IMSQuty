<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'name',
        'type',
        'description',
        'parameters',
        'result_data',
        'status',
        'generated_at',
        'file_path',
        'format',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'parameters' => 'array',
        'result_data' => 'array',
        'generated_at' => 'datetime'
    ];

    const TYPE_ASSET = 'Asset';
    const TYPE_TICKET = 'Ticket';
    const TYPE_FINANCIAL = 'Financial';
    const TYPE_INVENTORY = 'Inventory';
    const TYPE_USER = 'User';
    const TYPE_CUSTOM = 'Custom';

    const STATUS_PENDING = 'Pending';
    const STATUS_PROCESSING = 'Processing';
    const STATUS_COMPLETED = 'Completed';
    const STATUS_FAILED = 'Failed';

    const FORMAT_PDF = 'PDF';
    const FORMAT_EXCEL = 'Excel';
    const FORMAT_CSV = 'CSV';
    const FORMAT_JSON = 'JSON';

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }
}
