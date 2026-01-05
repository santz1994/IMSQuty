<?php

namespace App\Repositories;

use App\Models\Division;
use Illuminate\Support\Collection;
use Shared\Repositories\BaseRepository;

class DivisionRepository extends BaseRepository
{
    /**
     * Get the model class name.
     *
     * @return string
     */
    protected function model(): string
    {
        return Division::class;
    }

    /**
     * Get active divisions only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Division::active()->orderBy('name')->get();
    }

    /**
     * Find division by code.
     *
     * @param string $code
     * @return Division|null
     */
    public function findByCode(string $code): ?Division
    {
        return Division::where('code', $code)->first();
    }

    /**
     * Get divisions hierarchy (parents with children).
     *
     * @return Collection
     */
    public function getHierarchy(): Collection
    {
        return Division::whereNull('parent_id')
            ->with('children')
            ->active()
            ->orderBy('name')
            ->get();
    }
}
