-- ===========================================
-- MySQL User Setup for External Connections
-- ===========================================
-- This script ensures the imsquty user can connect from both
-- inside Docker (localhost) and from the Windows host (127.0.0.1)
-- ===========================================

-- Grant all privileges to imsquty user for both localhost and external connections
GRANT ALL PRIVILEGES ON *.* TO 'imsquty'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'imsquty'@'localhost' WITH GRANT OPTION;

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show user configuration for verification
SELECT user, host, plugin FROM mysql.user WHERE user IN ('root', 'imsquty');
