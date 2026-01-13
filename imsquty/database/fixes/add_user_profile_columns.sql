-- Add missing columns to users table for TestUsersSeeder
-- Created: January 13, 2026
-- Purpose: Enable user profile information and department/team relationships
USE imsquty;
-- Add department_id column with foreign key
ALTER TABLE users
ADD COLUMN department_id BIGINT UNSIGNED NULL
AFTER phone,
    ADD CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE
SET NULL;
-- Add team_id column with foreign key  
ALTER TABLE users
ADD COLUMN team_id BIGINT UNSIGNED NULL
AFTER department_id,
    ADD CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE
SET NULL;
-- Add position column
ALTER TABLE users
ADD COLUMN position VARCHAR(100) NULL
AFTER team_id;
-- Add bio column
ALTER TABLE users
ADD COLUMN bio TEXT NULL
AFTER position;
-- Add indexes for better query performance
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_team ON users(team_id);
-- Verify columns were added
DESCRIBE users;