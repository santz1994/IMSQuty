<?php

namespace App\Repositories;

use App\Models\Manufacturer;
use Illuminate\Support\Collection;
use Shared\Repositories\BaseRepository;

class ManufacturerRepository extends BaseRepository
{
    /**
     * Get the model class name.
     *
     * @return string
     */
    protected function model(): string
    {
        return Manufacturer::class;
    }

    /**
     * Get active manufacturers only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Manufacturer::active()->orderBy('name')->get();
    }

    /**
     * Find manufacturer by code.
     *
     * @param string $code
     * @return Manufacturer|null
     */
    public function findByCode(string $code): ?Manufacturer
    {
        return Manufacturer::where('code', $code)->first();
    }
}
