-- Insert test users
INSERT INTO users (
        first_name,
        last_name,
        email,
        password,
        status,
        created_by,
        created_at,
        updated_at
    )
VALUES (
        'Daniel',
        'Rizaldy',
        'daniel@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    ),
    (
        'Super',
        'Admin',
        'superadmin@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    ),
    (
        'John',
        'Director',
        'director@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    ),
    (
        'Jane',
        'Manager',
        'manager@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    ),
    (
        'Alice',
        'HR',
        'hr@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    ),
    (
        'Bob',
        'Receptionist',
        'receptionist@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    ),
    (
        'Charlie',
        'Admin',
        'admin@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    ),
    (
        'Diana',
        'User',
        'user@quty.co.id',
        '$2y$12$FjFQ0PjM8N8X0zMvR1Z3XuV0P0ZQKzN0P0ZQKzN0P0ZQKzN0P0ZQK',
        'active',
        1,
        NOW(),
        NOW()
    );
-- Assign roles to users using role names
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    1
FROM roles r
WHERE r.name = 'developer';
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    2
FROM roles r
WHERE r.name = 'superadmin';
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    3
FROM roles r
WHERE r.name = 'director';
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    4
FROM roles r
WHERE r.name = 'manager';
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    5
FROM roles r
WHERE r.name = 'hr';
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    6
FROM roles r
WHERE r.name = 'receptionist';
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    7
FROM roles r
WHERE r.name = 'admin';
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id,
    'App\\Models\\User',
    8
FROM roles r
WHERE r.name = 'user';