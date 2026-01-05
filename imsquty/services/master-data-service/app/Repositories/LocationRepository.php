<?php

namespace App\Repositories;

use App\Models\Location;
use Illuminate\Support\Collection;
use Shared\Repositories\BaseRepository;

class LocationRepository extends BaseRepository
{
    /**
     * Get the model class name.
     *
     * @return string
     */
    protected function model(): string
    {
        return Location::class;
    }

    /**
     * Get active locations only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Location::active()->orderBy('name')->get();
    }

    /**
     * Find location by code.
     *
     * @param string $code
     * @return Location|null
     */
    public function findByCode(string $code): ?Location
    {
        return Location::where('code', $code)->first();
    }

    /**
     * Get locations hierarchy (parents with children).
     *
     * @return Collection
     */
    public function getHierarchy(): Collection
    {
        return Location::whereNull('parent_id')
            ->with('children')
            ->active()
            ->orderBy('name')
            ->get();
    }
}
