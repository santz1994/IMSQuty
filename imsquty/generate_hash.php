<?php
// Generate proper bcrypt password hash
$password = 'Dev@2026!Secure';
$hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

echo "Email: daniel@quty.co.id\n";
echo "Password: " . $password . "\n";
echo "Hash: " . $hashed . "\n";

// Try to match it
$verified = password_verify($password, $hashed);
echo "Verified: " . ($verified ? "YES" : "NO") . "\n";
?>
