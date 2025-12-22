<?php

namespace Database\Factories;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Asset Factory
 * 
 * Generates test data for Asset model
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asset>
 */
class AssetFactory extends Factory
{
    protected $model = Asset::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_tag' => 'AST-' . strtoupper(fake()->unique()->bothify('??###')),
            'name' => fake()->randomElement([
                'Dell Latitude 7490',
                'HP ProBook 450 G8',
                'Lenovo ThinkPad X1 Carbon',
                'Dell OptiPlex 7090',
                'HP EliteDesk 800 G6',
                'Dell UltraSharp U2720Q Monitor',
                'HP LaserJet Pro M404dn',
                'Cisco Catalyst 2960 Switch',
                'TP-Link Archer AX6000 Router',
                'APC Smart-UPS 1500VA',
            ]),
            'serial_number' => strtoupper(fake()->bothify('SN-?????-######')),
            'location_id' => fake()->optional(0.9)->numberBetween(1, 20),
        ];
    }

    /**
     * Indicate that the asset is available (in stock)
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 1, // Available status
            'assigned_to' => null,
        ]);
    }

    /**
     * Indicate that the asset is assigned to a user
     */
    public function assigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 2, // Assigned status
            'assigned_to' => fake()->numberBetween(1, 50),
        ]);
    }

    /**
     * Indicate that the asset is in maintenance
     */
    public function inMaintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 3, // In Maintenance status
            'assigned_to' => null,
        ]);
    }

    /**
     * Indicate that the asset is retired
     */
    public function retired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 4, // Retired status
            'assigned_to' => null,
        ]);
    }

    /**
     * Indicate that the asset is broken
     */
    public function broken(): static
    {
        return $this->state(fn (array $attributes) => [
            'status_id' => 5, // Broken status
            'assigned_to' => null,
        ]);
    }

    /**
     * Indicate that the asset has an IP address (network device)
     */
    public function withNetwork(): static
    {
        return $this->state(fn (array $attributes) => [
            'ip_address' => fake()->localIpv4(),
            'mac_address' => fake()->macAddress(),
        ]);
    }

    /**
     * Indicate that the asset has expired warranty
     */
    public function warrantyExpired(): static
    {
        return $this->state(fn (array $attributes) => [
            'purchase_date' => fake()->dateTimeBetween('-10 years', '-3 years'),
            'warranty_months' => 12,
        ]);
    }

    /**
     * Indicate that the asset has expiring warranty (within 30 days)
     */
    public function warrantyExpiring(): static
    {
        $warrantyMonths = 24;
        $purchaseDate = now()->subMonths($warrantyMonths)->subDays(20); // Warranty expires in ~10 days

        return $this->state(fn (array $attributes) => [
            'purchase_date' => $purchaseDate,
            'warranty_months' => $warrantyMonths,
        ]);
    }

    /**
     * Indicate that the asset is a laptop
     */
    public function laptop(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => fake()->randomElement([
                'Dell Latitude 7490',
                'HP ProBook 450 G8',
                'Lenovo ThinkPad X1 Carbon',
                'MacBook Pro 14"',
                'ASUS ZenBook 14',
            ]),
        ]);
    }

    /**
     * Indicate that the asset is a desktop
     */
    public function desktop(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => fake()->randomElement([
                'Dell OptiPlex 7090',
                'HP EliteDesk 800 G6',
                'Lenovo ThinkCentre M75q',
                'ASUS ExpertCenter D5',
            ]),
        ]);
    }

    /**
     * Indicate that the asset is a monitor
     */
    public function monitor(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => fake()->randomElement([
                'Dell UltraSharp U2720Q',
                'HP E24 G4 Monitor',
                'LG 27UK850-W',
                'BenQ PD2700U',
            ]),
            'ip_address' => null,
            'mac_address' => null,
        ]);
    }
}
