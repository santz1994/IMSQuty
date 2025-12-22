<?php

namespace Database\Factories;

use App\Models\Pcspec;
use Illuminate\Database\Eloquent\Factories\Factory;

class PcspecFactory extends Factory
{
    protected $model = Pcspec::class;

    public function definition(): array
    {
        $cpus = ['Intel Core i3-12100', 'Intel Core i5-12400', 'Intel Core i7-12700', 'AMD Ryzen 5 5600X', 'AMD Ryzen 7 5800X'];
        $rams = [4, 8, 16, 32, 64];
        $storages = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '512GB NVMe'];
        $gpus = ['Intel UHD Graphics', 'NVIDIA GTX 1650', 'NVIDIA RTX 3060', 'NVIDIA RTX 3080', 'AMD Radeon RX 6600'];

        return [
            'name' => $this->faker->randomElement(['Basic', 'Standard', 'Professional', 'Gaming', 'Workstation']) . ' PC Configuration',
            'cpu' => $this->faker->randomElement($cpus),
            'ram_gb' => $this->faker->randomElement($rams),
            'storage' => $this->faker->randomElement($storages),
            'gpu' => $this->faker->optional()->randomElement($gpus),
            'motherboard' => $this->faker->optional()->randomElement(['ASUS Prime', 'MSI Pro', 'Gigabyte B550']),
            'psu' => $this->faker->optional()->randomElement(['500W', '650W', '750W', '850W']),
            'case_type' => $this->faker->optional()->randomElement(['ATX Tower', 'Micro ATX', 'Mini ITX']),
            'description' => $this->faker->optional()->sentence(),
            'is_active' => $this->faker->boolean(90),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
