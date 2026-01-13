<?php
try {
    $pdo = new PDO('mysql:host=mysql;port=3306;dbname=imsquty', 'imsquty', 'imsquty112233');
    echo "DB Connection: ✅ SUCCESS\n";
    $result = $pdo->query('SELECT COUNT(*) as cnt FROM users');
    $row = $result->fetch();
    echo "Users count: " . $row['cnt'] . "\n";
    
    // Check if daniel user exists
    $stmt = $pdo->prepare('SELECT id, email, status FROM users WHERE email = ?');
    $stmt->execute(['daniel@quty.co.id']);
    $user = $stmt->fetch();
    if ($user) {
        echo "✅ daniel@quty.co.id found (ID: " . $user['id'] . ", Status: " . $user['status'] . ")\n";
    } else {
        echo "❌ daniel@quty.co.id NOT found\n";
    }
} catch (Exception $e) {
    echo "DB Connection ERROR: " . $e->getMessage() . "\n";
}
?>
