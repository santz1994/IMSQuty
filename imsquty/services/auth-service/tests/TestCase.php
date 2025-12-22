<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Setup the test environment.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Additional test setup can go here
    }

    /**
     * Clean up the testing environment.
     *
     * @return void
     */
    protected function tearDown(): void
    {
        parent::tearDown();
    }
}
