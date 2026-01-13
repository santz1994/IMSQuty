SELECT u.id, u.email, u.username, r.id as role_id, r.name as role_name, r.level FROM users u 
LEFT JOIN model_has_roles mhr ON u.id = mhr.model_id AND mhr.model_type = 'App\\Models\\User' 
LEFT JOIN roles r ON mhr.role_id = r.id WHERE u.id = 1;
