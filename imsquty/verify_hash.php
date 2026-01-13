<?php
$hash = '$2y$12$kdCy6UT0MwkXf3UIOK0pT.Pco1c8Tryjg7ibM1uUtRC4S0MunAZZO';
$password = 'Password123!';
$matches = password_verify($password, $hash);
echo "Hash: " . substr($hash, 0, 40) . "...\n";
echo "Password: $password\n";
echo "Matches: " . ($matches ? "YES ✅" : "NO ❌") . "\n";
?>
