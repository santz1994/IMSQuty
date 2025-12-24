-- ============================================================
-- MIGRATION VALIDATION QUERIES
-- Database: quty2 (source) / imsquty (target)
-- Purpose: Verify data integrity before and after migration
-- ============================================================

-- ============================================================
-- 1. DATA INVENTORY COUNTS
-- ============================================================

-- Check total record counts in source
SELECT 'Users' AS table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Divisions', COUNT(*) FROM divisions
UNION ALL
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets
UNION ALL
SELECT 'Asset Models', COUNT(*) FROM asset_models
UNION ALL
SELECT 'Asset Types', COUNT(*) FROM asset_types
UNION ALL
SELECT 'Tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'Ticket Statuses', COUNT(*) FROM tickets_statuses
UNION ALL
SELECT 'Ticket Types', COUNT(*) FROM tickets_types
UNION ALL
SELECT 'Ticket Priorities', COUNT(*) FROM tickets_priorities
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

-- ============================================================
-- 2. FOREIGN KEY INTEGRITY CHECKS
-- ============================================================

-- Orphan users (deleted but referenced)
-- Note: Old system may have hard deletes
SELECT COUNT(*) as orphan_users_in_assets
FROM assets a
WHERE a.assigned_to IS NOT NULL 
  AND a.assigned_to NOT IN (SELECT id FROM users);

SELECT COUNT(*) as orphan_users_in_tickets
FROM tickets t
WHERE t.assigned_to IS NOT NULL 
  AND t.assigned_to NOT IN (SELECT id FROM users);

-- Orphan divisions (assets with non-existent division)
SELECT COUNT(*) as orphan_divisions_in_assets
FROM assets a
WHERE a.division_id IS NOT NULL 
  AND a.division_id NOT IN (SELECT id FROM divisions);

-- Orphan asset types
SELECT COUNT(*) as orphan_asset_types
FROM assets a
WHERE a.model_id IS NOT NULL 
  AND a.model_id NOT IN (SELECT id FROM asset_models);

-- Orphan ticket statuses
SELECT COUNT(*) as orphan_ticket_statuses
FROM tickets t
WHERE t.ticket_status_id IS NOT NULL 
  AND t.ticket_status_id NOT IN (SELECT id FROM tickets_statuses);

-- Orphan ticket types
SELECT COUNT(*) as orphan_ticket_types
FROM tickets t
WHERE t.ticket_type_id IS NOT NULL 
  AND t.ticket_type_id NOT IN (SELECT id FROM tickets_types);

-- Orphan ticket priorities
SELECT COUNT(*) as orphan_ticket_priorities
FROM tickets t
WHERE t.ticket_priority_id IS NOT NULL 
  AND t.ticket_priority_id NOT IN (SELECT id FROM tickets_priorities);

-- ============================================================
-- 3. DUPLICATE DETECTION
-- ============================================================

-- Duplicate emails (should be 0)
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Duplicate asset tags (should be unique)
SELECT asset_tag, COUNT(*) as count
FROM assets
WHERE asset_tag IS NOT NULL
GROUP BY asset_tag
HAVING COUNT(*) > 1;

-- Duplicate serial numbers (should be unique)
SELECT serial_number, COUNT(*) as count
FROM assets
WHERE serial_number IS NOT NULL AND serial_number != ''
GROUP BY serial_number
HAVING COUNT(*) > 1;

-- Duplicate QR codes (should be unique)
SELECT qr_code, COUNT(*) as count
FROM assets
WHERE qr_code IS NOT NULL
GROUP BY qr_code
HAVING COUNT(*) > 1;

-- Duplicate ticket codes (should be unique)
SELECT ticket_code, COUNT(*) as count
FROM tickets
WHERE ticket_code IS NOT NULL
GROUP BY ticket_code
HAVING COUNT(*) > 1;

-- ============================================================
-- 4. TIMESTAMP CONSISTENCY
-- ============================================================

-- Check for created_at > updated_at (invalid)
SELECT COUNT(*) as invalid_timestamps_users
FROM users
WHERE created_at > updated_at;

SELECT COUNT(*) as invalid_timestamps_assets
FROM assets
WHERE created_at > updated_at;

SELECT COUNT(*) as invalid_timestamps_tickets
FROM tickets
WHERE created_at > updated_at;

-- Check for future dates in audit_logs
SELECT COUNT(*) as future_dates_in_audit_logs
FROM audit_logs
WHERE created_at > NOW();

-- Check for very old dates (before 2016)
SELECT COUNT(*) as pre_2016_records
FROM users
WHERE created_at < '2016-01-01';

-- ============================================================
-- 5. DATA PATTERN VALIDATION
-- ============================================================

-- Validate email format (basic check)
SELECT COUNT(*) as invalid_emails
FROM users
WHERE email NOT LIKE '%@%.%';

-- Check for NULL passwords (should all have passwords)
SELECT COUNT(*) as null_passwords
FROM users
WHERE password IS NULL OR password = '';

-- Check for empty asset tags
SELECT COUNT(*) as empty_asset_tags
FROM assets
WHERE asset_tag IS NULL OR asset_tag = '';

-- Check for missing descriptions in tickets
SELECT COUNT(*) as missing_descriptions
FROM tickets
WHERE description IS NULL OR description = '';

-- ============================================================
-- 6. BUSINESS LOGIC VALIDATION
-- ============================================================

-- Check assets with invalid status
SELECT DISTINCT a.status_id
FROM assets a
LEFT JOIN statuses s ON a.status_id = s.id
WHERE s.id IS NULL
ORDER BY a.status_id;

-- Check users not assigned to any division (should be rare)
SELECT id, name, email
FROM users
WHERE division_id IS NULL
LIMIT 20;

-- Check active users (is_active = 1)
SELECT COUNT(*) as active_users
FROM users
WHERE is_active = 1;

SELECT COUNT(*) as inactive_users
FROM users
WHERE is_active = 0;

-- Check tickets by status
SELECT ts.status, COUNT(t.id) as count
FROM tickets t
LEFT JOIN tickets_statuses ts ON t.ticket_status_id = ts.id
GROUP BY t.ticket_status_id, ts.status
ORDER BY count DESC;

-- Check tickets by priority
SELECT tp.priority, COUNT(t.id) as count
FROM tickets t
LEFT JOIN tickets_priorities tp ON t.ticket_priority_id = tp.id
GROUP BY t.ticket_priority_id, tp.priority
ORDER BY count DESC;

-- ============================================================
-- 7. AUDIT LOG ANALYSIS
-- ============================================================

-- Check audit log coverage
SELECT event_type, COUNT(*) as count
FROM audit_logs
GROUP BY event_type
ORDER BY count DESC;

-- Check audit actions
SELECT action, COUNT(*) as count
FROM audit_logs
GROUP BY action
ORDER BY count DESC;

-- Most active users (by audit logs)
SELECT user_id, COUNT(*) as actions
FROM audit_logs
GROUP BY user_id
ORDER BY actions DESC
LIMIT 10;

-- Check model coverage
SELECT model_type, COUNT(*) as count
FROM audit_logs
WHERE model_type IS NOT NULL AND model_type != ''
GROUP BY model_type
ORDER BY count DESC;

-- ============================================================
-- 8. FIELD CONTENT SAMPLES (for review)
-- ============================================================

-- Sample users
SELECT id, name, email, division_id, is_active, created_at
FROM users
ORDER BY id ASC
LIMIT 10;

-- Sample assets
SELECT id, asset_tag, serial_number, division_id, status_id, created_at
FROM assets
ORDER BY id ASC
LIMIT 10;

-- Sample tickets
SELECT id, ticket_code, subject, assigned_to, ticket_status_id, created_at
FROM tickets
ORDER BY id DESC
LIMIT 10;

-- Sample audit logs (recent)
SELECT id, user_id, action, model_type, description, created_at
FROM audit_logs
ORDER BY id DESC
LIMIT 20;

-- ============================================================
-- 9. MIGRATION READINESS CHECKLIST
-- ============================================================

-- Generate checklist report
SELECT 
    'Total Users' AS check_item,
    COUNT(*) AS count,
    CASE WHEN COUNT(*) > 0 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM users
WHERE is_active = 1

UNION ALL

SELECT 'Users with valid email', COUNT(*), 
    CASE WHEN COUNT(*) = (SELECT COUNT(*) FROM users) THEN '✓ PASS' ELSE '✗ FAIL' END
FROM users
WHERE email LIKE '%@%.%'

UNION ALL

SELECT 'Assets with asset_tag', COUNT(),
    CASE WHEN COUNT(*) = (SELECT COUNT(*) FROM assets) THEN '✓ PASS' ELSE '✗ FAIL' END
FROM assets
WHERE asset_tag IS NOT NULL AND asset_tag != ''

UNION ALL

SELECT 'Tickets with ticket_code', COUNT(*),
    CASE WHEN COUNT(*) = (SELECT COUNT(*) FROM tickets) THEN '✓ PASS' ELSE '✗ FAIL' END
FROM tickets
WHERE ticket_code IS NOT NULL AND ticket_code != ''

UNION ALL

SELECT 'Audit logs present', COUNT(*),
    CASE WHEN COUNT(*) > 500 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM audit_logs

UNION ALL

SELECT 'No orphan assets (division)', COUNT(*),
    CASE WHEN COUNT(*) = 0 THEN '✓ PASS' ELSE '✗ FAIL' END
FROM assets
WHERE division_id NOT IN (SELECT id FROM divisions);

-- ============================================================
-- 10. PERFORMANCE BASELINE
-- ============================================================

-- Table sizes (approximate)
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS table_size_mb
FROM information_schema.tables
WHERE table_schema = 'quty2'
  AND table_type = 'BASE TABLE'
ORDER BY table_size_mb DESC;

-- Query performance baseline (before migration)
-- Time these queries and record baseline
SELECT COUNT(*) FROM users; -- Should be fast (< 50ms)
SELECT COUNT(*) FROM assets; -- Should be fast (< 50ms)
SELECT COUNT(*) FROM tickets; -- Should be fast (< 50ms)
SELECT COUNT(*) FROM audit_logs; -- Might be slower (100-500ms)

-- ============================================================
-- 11. POST-MIGRATION VERIFICATION
-- ============================================================

-- Run these queries on imsquty database AFTER migration

-- Compare counts
-- imsquty.users COUNT should equal quty2.users COUNT
-- imsquty.assets COUNT should equal quty2.assets COUNT
-- etc.

-- Verify no data loss
SELECT 
    (SELECT COUNT(*) FROM imsquty.users) as imsquty_users,
    (SELECT COUNT(*) FROM quty2.users) as quty2_users;

-- Check data consistency
-- Sample: Verify user 4 has correct data
SELECT id, name, email, division_id
FROM imsquty.users
WHERE id = 4;

-- Verify foreign key relationships in new database
SELECT COUNT(*) as tickets_with_valid_status
FROM imsquty.tickets t
INNER JOIN imsquty.tickets_statuses ts ON t.ticket_status_id = ts.id;

-- ============================================================
-- 12. CLEANUP QUERIES (Run if orphans found)
-- ============================================================

-- IMPORTANT: Run only if orphans confirmed above

-- Fix: Assign orphan assets to default division
-- UPDATE assets SET division_id = 1 
-- WHERE division_id NOT IN (SELECT id FROM divisions);

-- Fix: Unassign orphan tickets
-- UPDATE tickets SET assigned_to = NULL 
-- WHERE assigned_to NOT IN (SELECT id FROM users);

-- Fix: Reset invalid timestamps
-- UPDATE users SET updated_at = created_at 
-- WHERE created_at > updated_at;

-- ============================================================
-- END OF VALIDATION QUERIES
-- ============================================================

/*
HOW TO USE THIS SCRIPT:

1. BEFORE MIGRATION (on quty2):
   - Copy section 1-9
   - Run all queries to establish baseline
   - Record all results in DATABASE_MIGRATION_PLAN.md
   - Note any failures that need fixing

2. FIX ISSUES (if any):
   - Uncomment cleanup queries in section 12
   - Run fixes and re-run validation

3. AFTER MIGRATION (on imsquty):
   - Run section 11 queries
   - Compare results with baseline
   - Verify no data loss

4. PERFORMANCE TESTING:
   - Baseline queries in section 10
   - Compare before/after migration
   - Monitor query times during peak usage

EXPECTED RESULTS:
✓ Zero orphan records
✓ Zero duplicate emails/tags
✓ Zero invalid timestamps
✓ All foreign keys valid
✓ All counts match source
✓ Query times < 1 second
*/
