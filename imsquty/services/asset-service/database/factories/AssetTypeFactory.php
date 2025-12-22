<?php

namespace Database\Factories;

use App\Models\AssetType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * AssetType Factory
 * 
 * Generates test data for AssetType model
 * Matches monolith asset_types table schema: type_name, abbreviation, spare
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetType>
 */
class AssetTypeFactory extends Factory
{
    protected $model = AssetType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            ['type_name' => 'Laptop', 'abbreviation' => 'LPT'],
            ['type_name' => 'Desktop', 'abbreviation' => 'DSK'],
            ['type_name' => 'Monitor', 'abbreviation' => 'MON'],
            ['type_name' => 'Printer', 'abbreviation' => 'PRT'],
            ['type_name' => 'Server', 'abbreviation' => 'SRV'],
            ['type_name' => 'Router', 'abbreviation' => 'RTR'],
            ['type_name' => 'Switch', 'abbreviation' => 'SWT'],
            ['type_name' => 'Mouse', 'abbreviation' => 'MOU'],
            ['type_name' => 'Keyboard', 'abbreviation' => 'KBD'],
            ['type_name' => 'UPS', 'abbreviation' => 'UPS'],
            ['type_name' => 'Network Card', 'abbreviation' => 'NIC'],
            ['type_name' => 'Storage Drive', 'abbreviation' => 'STO'],
            ['type_name' => 'Memory Module', 'abbreviation' => 'RAM'],
        ];

        $type = fake()->randomElement($types);

        return [
            'type_name' => $type['type_name'],
            'abbreviation' => $type['abbreviation'],
            'spare' => fake()->boolean(30), // 30% chance of being a spare part
        ];
    }

    /**
     * Indicate that the asset type is a spare part.
     */
    public function spare(): static
    {
        return $this->state(fn (array $attributes) => [
            'spare' => true,
        ]);
    }

    /**
     * Indicate that the asset type is NOT a spare part.
     */
    public function notSpare(): static
    {
        return $this->state(fn (array $attributes) => [
            'spare' => false,
        ]);
    }
}
