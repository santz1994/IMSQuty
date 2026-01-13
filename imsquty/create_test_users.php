<?php
// Create test users
$mysqli = new mysqli('mysql', 'imsquty', 'imsquty112233', 'imsquty', 3306);

if ($mysqli->connect_error) {
    die('Database connection failed: ' . $mysqli->connect_error);
}

// Insert users
$users = [
    ['Daniel', 'Rizaldy', 'daniel@quty.co.id'],
    ['Super', 'Admin', 'superadmin@quty.co.id'],
    ['John', 'Director', 'director@quty.co.id'],
    ['Jane', 'Manager', 'manager@quty.co.id'],
    ['Alice', 'HR', 'hr@quty.co.id'],
    ['Bob', 'Receptionist', 'receptionist@quty.co.id'],
    ['Charlie', 'Admin', 'admin@quty.co.id'],
    ['Diana', 'User', 'user@quty.co.id'],
];

$password_hash = '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK';

foreach ($users as $user) {
    $first_name = $user[0];
    $last_name = $user[1];
    $email = $user[2];
    
    $sql = "INSERT IGNORE INTO users (first_name, last_name, email, password, status, created_by, created_at, updated_at) 
            VALUES ('$first_name', '$last_name', '$email', '$password_hash', 'active', 1, NOW(), NOW())";
    
    if (!$mysqli->query($sql)) {
        echo "Error: " . $mysqli->error . "\n";
    } else {
        echo "✓ $email created\n";
    }
}

// Get users
$result = $mysqli->query("SELECT id, email FROM users ORDER BY id");
echo "\n✓ Total users: " . $result->num_rows . "\n";
while ($row = $result->fetch_assoc()) {
    echo "  - ID {$row['id']}: {$row['email']}\n";
}

$mysqli->close();
?>
