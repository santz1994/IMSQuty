<?php
require __DIR__ . '/bootstrap/app.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

// Load Eloquent
$app->make('db');

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    // Test 1: Find user
    $user = User::where('username', 'daniel')->first();
    echo "Test 1 - Find user by username:\n";
    if ($user) {
        echo "✅ User found: " . $user->email . "\n";
        echo "   Password hash (first 30 chars): " . substr($user->password, 0, 30) . "...\n";
    } else {
        echo "❌ User NOT found\n";
    }
    
    // Test 2: Check password
    if ($user) {
        $pass = "Password123!";
        $matches = Hash::check($pass, $user->password);
        echo "\nTest 2 - Password verification:\n";
        echo "Password: $pass\n";
        echo "Match: " . ($matches ? "✅ YES" : "❌ NO") . "\n";
    }
    
    // Test 3: Load relations
    if ($user) {
        $user->load('roles');
        echo "\nTest 3 - Load relations:\n";
        echo "Roles count: " . $user->roles->count() . "\n";
        foreach ($user->roles as $role) {
            echo "  - " . $role->name . "\n";
        }
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
?>
