<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketsCannedField extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'ticket_type_id',
        'created_by',
        'is_public',
        'usage_count',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'usage_count' => 'integer',
    ];

    // Relationships
    public function type()
    {
        return $this->belongsTo(TicketsType::class, 'ticket_type_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopePrivate($query)
    {
        return $query->where('is_public', false);
    }

    public function scopeMostUsed($query)
    {
        return $query->orderBy('usage_count', 'desc');
    }

    // Increment usage count
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }
}
