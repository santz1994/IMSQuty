CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE(name, guard_name)
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL DEFAULT 'web',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE(name, guard_name)
);

CREATE TABLE IF NOT EXISTS model_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    PRIMARY KEY(permission_id, model_id, model_type)
);

CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT UNSIGNED NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    PRIMARY KEY(role_id, model_id, model_type)
);

CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY(permission_id, role_id)
);

INSERT IGNORE INTO roles (name, guard_name, created_at, updated_at) VALUES 
('Admin', 'web', NOW(), NOW()), 
('User', 'web', NOW(), NOW()), 
('Manager', 'web', NOW(), NOW());

SELECT 'RBAC Tables Created' as status;
SELECT COUNT(*) as role_count FROM roles;
