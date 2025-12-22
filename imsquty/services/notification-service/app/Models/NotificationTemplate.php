<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Notification Template Model
 * 
 * Represents reusable notification templates
 * 
 * @property int $id
 * @property string $code Unique template code
 * @property string $name
 * @property string $type Email|SMS|Push
 * @property string $channel
 * @property string|null $subject
 * @property string $body Template body with placeholders
 * @property array|null $variables List of available variables
 * @property bool $is_active
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \DateTime $created_at
 * @property \DateTime $updated_at
 * @property \DateTime|null $deleted_at
 */
class NotificationTemplate extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'code',
        'name',
        'type',
        'channel',
        'subject',
        'body',
        'variables',
        'is_active',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get notifications using this template
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'template_code', 'code');
    }

    /**
     * Scope: Active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: By code
     */
    public function scopeByCode($query, string $code)
    {
        return $query->where('code', $code);
    }

    /**
     * Scope: By type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Compile template with variables
     */
    public function compile(array $data): string
    {
        $body = $this->body;
        
        foreach ($data as $key => $value) {
            $body = str_replace("{{" . $key . "}}", $value, $body);
        }
        
        return $body;
    }

    /**
     * Compile subject with variables
     */
    public function compileSubject(array $data): string
    {
        if (!$this->subject) {
            return '';
        }

        $subject = $this->subject;
        
        foreach ($data as $key => $value) {
            $subject = str_replace("{{" . $key . "}}", $value, $subject);
        }
        
        return $subject;
    }
}
