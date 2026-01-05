<?php

namespace App\Repositories;

use App\Models\WarrantyType;
use Illuminate\Support\Collection;
use Shared\Repositories\BaseRepository;

class WarrantyTypeRepository extends BaseRepository
{
    /**
     * Get the model class name.
     *
     * @return string
     */
    protected function model(): string
    {
        return WarrantyType::class;
    }

    /**
     * Get active warranty types only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return WarrantyType::active()->orderBy('name')->get();
    }
}
