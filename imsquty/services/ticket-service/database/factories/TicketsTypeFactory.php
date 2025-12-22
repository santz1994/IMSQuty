<?php

namespace Database\Factories;

use App\Models\TicketsType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketsType>
 */
class TicketsTypeFactory extends Factory
{
    protected $model = TicketsType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            'Bug',
            'Feature Request',
            'Hardware Issue',
            'Software Issue',
            'Network Issue',
            'Access Request',
            'General Inquiry',
        ];

        $type = $this->faker->randomElement($types);

        return [
            'type' => $type,
            'description' => $type . ' ticket type',
        ];
    }
}
