<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=imsquty', 'root', '');
$result = $pdo->query('SHOW TABLES LIKE "roles"')->fetchAll();
echo 'Roles table exists: ' . (count($result) > 0 ? 'YES' : 'NO') . PHP_EOL;

$result = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
echo 'Total tables: ' . count($result) . PHP_EOL;

$rbac = array_filter($result, fn($t) => in_array($t, ['roles', 'permissions', 'model_has_roles', 'model_has_permissions', 'role_has_permissions']));
echo 'RBAC tables found: ' . implode(', ', $rbac) . PHP_EOL;
