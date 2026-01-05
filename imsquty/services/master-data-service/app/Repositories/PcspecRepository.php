<?php

namespace App\Repositories;

use App\Models\Pcspec;
use Illuminate\Support\Collection;
use Shared\Repositories\BaseRepository;

class PcspecRepository extends BaseRepository
{
    /**
     * Get the model class name.
     *
     * @return string
     */
    protected function model(): string
    {
        return Pcspec::class;
    }

    /**
     * Get active PC specifications only.
     *
     * @return Collection
     */
    public function getActive(): Collection
    {
        return Pcspec::active()->orderBy('name')->get();
    }
}
