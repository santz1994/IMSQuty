-- Create developer user
INSERT IGNORE INTO users (name, email, email_verified_at, password, created_at, updated_at) VALUES 
('Daniel Rizaldy', 'daniel@quty.co.id', NOW(), '$2y$12$0lM4pBN7FbLVV.5f9Xe1uuB4U4rHhGJ8oZ7x6N6J.6K8L9m0P9aBm', NOW(), NOW());

-- Get the developer role ID (if it exists, otherwise use superadmin)
SET @dev_role = (SELECT id FROM roles WHERE name = 'developer' LIMIT 1);
IF @dev_role IS NULL THEN
  SET @dev_role = (SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1);
END IF;

-- Assign developer role to daniel
DELETE FROM model_has_roles WHERE model_id = (SELECT id FROM users WHERE email = 'daniel@quty.co.id');
INSERT IGNORE INTO model_has_roles (role_id, model_type, model_id) 
SELECT @dev_role, 'App\\Models\\User', id FROM users WHERE email = 'daniel@quty.co.id';

-- Grant all permissions to developer role
DELETE FROM role_has_permissions WHERE role_id = @dev_role;
INSERT IGNORE INTO role_has_permissions (role_id, permission_id)
SELECT DISTINCT @dev_role, id FROM permissions;

SELECT 'Developer account created!' as status;
