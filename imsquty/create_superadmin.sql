-- Create Superadmin User Account for IMSQuty
-- Default credentials: superadmin / superadmin
-- This user has full access to all systems

-- Insert superadmin user
INSERT INTO users
    (username, email, password, first_name, last_name, phone, status, email_verified_at, remember_token, created_at, updated_at)
VALUES
    (
        'superadmin',
        'superadmin@imsquty.local',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
        'Super',
        'Admin',
        '+1-800-SUPERADMIN',
        'active',
        NOW(),
        NULL,
        NOW(),
        NOW()
)
ON DUPLICATE KEY
UPDATE updated_at = NOW();

-- Get the user ID
SELECT id, username, email, first_name, last_name, status
FROM users
WHERE username = 'superadmin';
