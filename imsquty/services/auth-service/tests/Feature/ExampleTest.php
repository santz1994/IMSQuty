<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        // Test the health check endpoint instead of root route
        $response = $this->get('/api/v1/health');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);
    }
}
