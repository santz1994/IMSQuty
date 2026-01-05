<?php

namespace App\Repositories;

use App\Models\Supplier;
use Illuminate\Support\Collection;
use Shared\Repositories\BaseRepository;

class SupplierRepository extends BaseRepository
{
    /**
     * Get the model class name.
     *
     * @return string
     */
    protected function model(): string
    {
        return Supplier::class;
    }

    /**
     * Get active suppliers only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Supplier::active()->orderBy('name')->get();
    }

    /**
     * Find supplier by code.
     *
     * @param string $code
     * @return Supplier|null
     */
    public function findByCode(string $code): ?Supplier
    {
        return Supplier::where('code', $code)->first();
    }
}
