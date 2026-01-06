<?php
require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    // Create Superadmin
    $superadmin = User::create([
        'username' => 'superadmin',
        'email' => 'superadmin@imsquty.local',
        'password' => bcrypt('superadmin'),
        'first_name' => 'Super',
        'last_name' => 'Admin',
        'phone' => '+1-800-SUPERADMIN',
        'status' => 'active',
        'email_verified_at' => now(),
    ]);

    echo "✅ Superadmin created!\n";
    echo "   Email: {$superadmin->email}\n";
    echo "   Username: {$superadmin->username}\n";
    echo "   Password: superadmin\n\n";

    // Create Admin user
    $admin = User::create([
        'username' => 'admin',
        'email' => 'admin@imsquty.local',
        'password' => bcrypt('admin'),
        'first_name' => 'Admin',
        'last_name' => 'User',
        'phone' => '+1-800-ADMIN',
        'status' => 'active',
        'email_verified_at' => now(),
    ]);

    echo "✅ Admin user created!\n";
    echo "   Email: {$admin->email}\n";
    echo "   Password: admin\n\n";

    // Create Regular user
    $user = User::create([
        'username' => 'user',
        'email' => 'user@imsquty.local',
        'password' => bcrypt('user'),
        'first_name' => 'John',
        'last_name' => 'Doe',
        'phone' => '+1-800-USER',
        'status' => 'active',
        'email_verified_at' => now(),
    ]);

    echo "✅ Regular user created!\n";
    echo "   Email: {$user->email}\n";
    echo "   Password: user\n\n";

    DB::commit();
    echo "✅ All test users created successfully!\n";

} catch (Exception $e) {
    DB::rollBack();
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
