<?php

namespace Database\Factories;

use App\Models\AssetModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * AssetModel Factory
 * 
 * Generates test data for AssetModel model
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetModel>
 */
class AssetModelFactory extends Factory
{
    protected $model = AssetModel::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_model' => fake()->unique()->bothify('Model-??###'),
            'asset_type_id' => fake()->numberBetween(1, 5), // Desktop, Laptop, Monitor, Printer, Network Device
            'manufacturer_id' => fake()->optional(0.9)->numberBetween(1, 20),
            'pcspec_id' => fake()->optional(0.6)->numberBetween(1, 30),
            'part_number' => fake()->optional(0.7)->bothify('PN-????-####'),
            'notes' => fake()->optional(0.4)->sentence(),
        ];
    }

    /**
     * Indicate that the asset model is for a laptop
     */
    public function laptop(): static
    {
        return $this->state(fn (array $attributes) => [
            'asset_model' => fake()->unique()->randomElement([
                'Latitude 7490',
                'ProBook 450 G8',
                'ThinkPad X1 Carbon Gen 9',
                'MacBook Pro 14" M1',
                'ZenBook 14 UX425',
                'EliteBook 840 G8',
                'Inspiron 15 5000',
                'Pavilion 15',
            ]),
            'asset_type_id' => 2, // Laptop type
        ]);
    }

    /**
     * Indicate that the asset model is for a desktop
     */
    public function desktop(): static
    {
        return $this->state(fn (array $attributes) => [
            'asset_model' => fake()->unique()->randomElement([
                'OptiPlex 7090',
                'EliteDesk 800 G6',
                'ThinkCentre M75q',
                'Vostro 3888',
                'ProDesk 400 G7',
                'Precision 3650',
            ]),
            'asset_type_id' => 1, // Desktop type
        ]);
    }

    /**
     * Indicate that the asset model is for a monitor
     */
    public function monitor(): static
    {
        return $this->state(fn (array $attributes) => [
            'asset_model' => fake()->unique()->randomElement([
                'UltraSharp U2720Q',
                'E24 G4 Monitor',
                '27UK850-W',
                'PD2700U',
                'PA278QV',
                'VG27AQ',
            ]),
            'asset_type_id' => 3, // Monitor type
            'pcspec_id' => null,
        ]);
    }

    /**
     * Indicate that the asset model is for a printer
     */
    public function printer(): static
    {
        return $this->state(fn (array $attributes) => [
            'asset_model' => fake()->unique()->randomElement([
                'LaserJet Pro M404dn',
                'Color LaserJet Pro MFP M479fdw',
                'EcoTank L3150',
                'WorkForce Pro WF-4830',
                'ImageCLASS MF743Cdw',
            ]),
            'asset_type_id' => 4, // Printer type
            'pcspec_id' => null,
        ]);
    }

    /**
     * Indicate that the asset model is for a network device
     */
    public function networkDevice(): static
    {
        return $this->state(fn (array $attributes) => [
            'asset_model' => fake()->unique()->randomElement([
                'Catalyst 2960-X',
                'Archer AX6000',
                'UniFi Dream Machine Pro',
                'ER-X EdgeRouter',
                'SG350-28P Switch',
            ]),
            'asset_type_id' => 5, // Network Device type
            'pcspec_id' => null,
        ]);
    }

    /**
     * Indicate Dell manufacturer
     */
    public function dell(): static
    {
        return $this->state(fn (array $attributes) => [
            'manufacturer_id' => 1, // Assuming Dell is ID 1
        ]);
    }

    /**
     * Indicate HP manufacturer
     */
    public function hp(): static
    {
        return $this->state(fn (array $attributes) => [
            'manufacturer_id' => 2, // Assuming HP is ID 2
        ]);
    }

    /**
     * Indicate Lenovo manufacturer
     */
    public function lenovo(): static
    {
        return $this->state(fn (array $attributes) => [
            'manufacturer_id' => 3, // Assuming Lenovo is ID 3
        ]);
    }
}
