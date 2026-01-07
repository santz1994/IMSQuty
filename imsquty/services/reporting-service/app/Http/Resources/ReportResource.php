<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'description' => $this->description,
            'parameters' => $this->parameters,
            'result_data' => $this->when($this->status === 'Completed', $this->result_data),
            'status' => $this->status,
            'format' => $this->format,
            'file_path' => $this->when($this->file_path, $this->file_path),
            'file_url' => $this->when($this->file_path, url('storage/' . $this->file_path)),
            'generated_at' => $this->generated_at?->toIso8601String(),
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String()
        ];
    }
}
