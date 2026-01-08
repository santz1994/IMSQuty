# Create Admin Users for IMSQuty
# Creates superadmin, director, manager, admin, hr, and regular user accounts

Write-Output "=== Creating Admin Users for IMSQuty ==="
Write-Output ""

$createUsersSql = @"
USE imsquty;

-- Create admin users (without role_id - will assign via model_has_roles)
INSERT INTO users (username, email, email_verified_at, password, first_name, last_name, status, created_at, updated_at)
VALUES
    -- Superadmin
    ('superadmin', 'superadmin@quty.co.id', NOW(), '\$2y\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Admin', 'active', NOW(), NOW()),
    
    -- Director  
    ('director', 'director@quty.co.id', NOW(), '\$2y\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Director', 'User', 'active', NOW(), NOW()),
    
    -- Manager
    ('manager', 'manager@quty.co.id', NOW(), '\$2y\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Manager', 'User', 'active', NOW(), NOW()),
    
    -- Admin
    ('admin', 'admin@quty.co.id', NOW(), '\$2y\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'active', NOW(), NOW()),
    
    -- HR
    ('hr', 'hr@quty.co.id', NOW(), '\$2y\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HR', 'User', 'active', NOW(), NOW()),
    
    -- Regular User
    ('user', 'user@quty.co.id', NOW(), '\$2y\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular', 'User', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    updated_at = NOW();

-- Assign roles via model_has_roles table
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT 1, 'App\\\\Models\\\\User', u.id FROM users u WHERE u.username = 'superadmin'
UNION ALL
SELECT 2, 'App\\\\Models\\\\User', u.id FROM users u WHERE u.username = 'director'
UNION ALL
SELECT 3, 'App\\\\Models\\\\User', u.id FROM users u WHERE u.username = 'manager'
UNION ALL
SELECT 4, 'App\\\\Models\\\\User', u.id FROM users u WHERE u.username = 'admin'
UNION ALL
SELECT 5, 'App\\\\Models\\\\User', u.id FROM users u WHERE u.username = 'hr'
UNION ALL
SELECT 6, 'App\\\\Models\\\\User', u.id FROM users u WHERE u.username = 'user'
ON DUPLICATE KEY UPDATE
    role_id = VALUES(role_id);

-- Show created users with their roles
SELECT 
    u.id,
    u.username,
    u.email,
    r.name as role,
    u.status,
    u.created_at
FROM users u
LEFT JOIN model_has_roles mhr ON mhr.model_id = u.id AND mhr.model_type = 'App\\\\Models\\\\User'
LEFT JOIN roles r ON r.id = mhr.role_id
ORDER BY mhr.role_id;
"@

Write-Output "Creating admin users..."
$createUsersSql | docker exec -i imsquty-mysql mysql -uimsquty -pimsquty112233 2>&1 | Select-String -NotMatch "Warning"

Write-Output ""
Write-Output "✅ Admin users created successfully!"
Write-Output ""
Write-Output "Login Credentials (all use password: 'password'):"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output "Superadmin: superadmin@quty.co.id / password"
Write-Output "Director:   director@quty.co.id   / password"
Write-Output "Manager:    manager@quty.co.id    / password"
Write-Output "Admin:      admin@quty.co.id      / password"
Write-Output "HR:         hr@quty.co.id         / password"
Write-Output "User:       user@quty.co.id       / password"
Write-Output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Output ""
Write-Output "Note: Password hash is Laravel's default test password 'password'"
Write-Output "⚠️  Change these passwords in production!"
