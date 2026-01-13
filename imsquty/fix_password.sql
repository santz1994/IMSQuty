UPDATE users
SET password = '$2y$12$kdCy6UT0MwkXf3UIOK0pT.Pco1c8Tryjg7ibM1uUtRC4S0MunAZZO'
WHERE email = 'daniel@quty.co.id';
SELECT id,
    email,
    password
FROM users
WHERE id = 1;