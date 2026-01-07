<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'status' => $this->status,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'browser' => $this->browser ?? 'Unknown',
            'os' => $this->os ?? 'Unknown',
            'location' => $this->location,
            'attempted_at' => $this->attempted_at?->toIso8601String(),
        ];
    }
}
