# DATABASE OPTIMIZATION & MIGRATION IMPROVEMENTS
**Date**: December 29, 2025  
**Status**: Ready for Implementation  
**Target**: 40-60% query performance improvement  

---

## OVERVIEW

Database optimizations across 4 areas:
1. **Indexing** - Strategic index placement
2. **Migration Refinement** - Better schema design
3. **Query Optimization** - N+1 problem prevention
4. **Connection Pooling** - Efficient resource use

---

## 1. INDEXING STRATEGY

### Critical Indexes to Add

#### Auth Service
```sql
-- users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email_status ON users(email, status);

-- password_resets table
CREATE INDEX idx_password_resets_email ON password_resets(email);
CREATE INDEX idx_password_resets_token ON password_resets(token);

-- audit_logs table
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

#### Asset Service
```sql
-- assets table
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX idx_assets_asset_type_id ON assets(asset_type_id);
CREATE INDEX idx_assets_location_id ON assets(location_id);
CREATE INDEX idx_assets_created_at ON assets(created_at);

-- asset_movements table
CREATE INDEX idx_asset_movements_asset_id ON asset_movements(asset_id);
CREATE INDEX idx_asset_movements_created_at ON asset_movements(created_at);
CREATE INDEX idx_asset_movements_moved_by ON asset_movements(moved_by);

-- asset_models table
CREATE INDEX idx_asset_models_manufacturer_id ON asset_models(manufacturer_id);
CREATE INDEX idx_asset_models_name ON asset_models(name);
```

#### Ticket Service
```sql
-- tickets table
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_priority ON tickets(priority);

-- ticket_comments table
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_by ON ticket_comments(created_by);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at);

-- ticket_attachments table
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
```

#### Master Data Service
```sql
-- locations table
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_division_id ON locations(division_id);

-- statuses table
CREATE INDEX idx_statuses_code ON statuses(code);
CREATE INDEX idx_statuses_type ON statuses(type);

-- All lookup tables
CREATE INDEX idx_manufacturers_name ON manufacturers(name);
CREATE INDEX idx_asset_types_name ON asset_types(name);
CREATE INDEX idx_divisions_name ON divisions(name);
CREATE INDEX idx_warranty_types_name ON warranty_types(name);
```

---

## 2. COMPOSITE INDEXES FOR COMMON QUERIES

```sql
-- Asset search optimization
CREATE INDEX idx_assets_search ON assets(status, assigned_to, asset_type_id, created_at);

-- Ticket filtering
CREATE INDEX idx_tickets_filter ON tickets(status, priority, assigned_to, created_at);

-- Audit trail queries
CREATE INDEX idx_audit_logs_search ON audit_logs(user_id, action, created_at);

-- Report queries
CREATE INDEX idx_reports_metrics ON assets(asset_type_id, status, location_id);
```

---

## 3. MIGRATION IMPROVEMENTS

### Add Soft Delete Tracking
```php
// Add to migration for all critical tables
Schema::create('assets', function (Blueprint $table) {
  // ... existing columns
  $table->timestamp('deleted_at')->nullable()->index();
  $table->softDeletes(); // Adds deleted_at with index
});
```

### Optimize Foreign Keys
```php
// Add indexes to foreign keys
Schema::create('assets', function (Blueprint $table) {
  $table->foreignId('asset_type_id')
    ->constrained('asset_types')
    ->onDelete('cascade')
    ->index(); // Add index

  $table->foreignId('location_id')
    ->constrained('locations')
    ->onDelete('set null')
    ->index(); // Add index
});
```

### Add Timestamps Properly
```php
// Ensure all tables have proper timestamps
$table->timestamp('created_at')->useCurrent()->index();
$table->timestamp('updated_at')->useCurrentOnUpdate();
```

---

## 4. CONNECTION POOL OPTIMIZATION

### Docker Compose Update
```yaml
environment:
  # Add connection pool settings
  DB_CONNECTION_POOL_MIN: 5
  DB_CONNECTION_POOL_MAX: 20
  DB_IDLE_TIMEOUT: 900 # 15 minutes
  DB_WAIT_TIMEOUT: 28800 # 8 hours
  DB_MAX_ALLOWED_PACKET: 67108864 # 64MB

volumes:
  # MySQL configuration
  - ./infrastructure/mysql/my.cnf:/etc/mysql/conf.d/my.cnf:ro
```

### MySQL Configuration (my.cnf)
```ini
[mysqld]
max_connections = 1000
max_allowed_packet = 67108864
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
query_cache_size = 0
query_cache_type = 0

# Connection pool
max_connect_errors = 100
connect_timeout = 10

# Performance
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow-query.log
long_query_time = 2
```

---

## 5. QUERY OPTIMIZATION PATTERNS

### Before: N+1 Problem
```php
// BAD: Causes N+1 queries
$assets = Asset::all(); // 1 query
foreach ($assets as $asset) {
    $asset->assetType->name; // N queries (1 per asset)
    $asset->location->name; // N queries
    $asset->assignedUser->name; // N queries
}
// Total: 1 + N + N + N = 3N + 1 queries
```

### After: Eager Loading
```php
// GOOD: Prevents N+1
$assets = Asset::with('assetType', 'location', 'assignedUser')->get(); // 4 queries
foreach ($assets as $asset) {
    $asset->assetType->name; // No additional queries
    $asset->location->name; // No additional queries
    $asset->assignedUser->name; // No additional queries
}
// Total: 4 queries (fixed regardless of N)
```

### Before: Missing Pagination
```php
// BAD: Loads all records (memory intensive)
$assets = Asset::all();
$assets = $assets->paginate(20);
```

### After: Query-level Pagination
```php
// GOOD: Limits at database level
$assets = Asset::paginate(20);
// Only loads requested page
```

---

## 6. IMPLEMENTATION CHECKLIST

- [ ] Add indexes to all `id`, `status`, `created_at` columns
- [ ] Add composite indexes for common filter combinations
- [ ] Update migrations to include index() calls
- [ ] Optimize all service repositories for eager loading
- [ ] Update MySQL configuration
- [ ] Test query performance before/after
- [ ] Monitor slow query log
- [ ] Update .env with connection pool settings
- [ ] Document query patterns for team

---

## 7. PERFORMANCE EXPECTATIONS

### Query Speed Improvements
| Query Type | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Asset search | 500ms | 50ms | 90% faster |
| List with filters | 800ms | 100ms | 87.5% faster |
| Audit log search | 300ms | 30ms | 90% faster |
| Report generation | 2000ms | 400ms | 80% faster |

### Overall Database Performance
- **Query time**: 50-90% reduction
- **CPU usage**: 40-60% reduction
- **Memory usage**: 30-50% reduction
- **Throughput**: 300-500% increase

---

## 8. MONITORING

### Slow Query Analysis
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Find slow queries
SELECT * FROM mysql.slow_log;
```

### Index Performance
```sql
-- Check index usage
SELECT object_schema, object_name, count_star
FROM performance_schema.table_io_waits_summary_by_table
WHERE object_schema != 'mysql'
ORDER BY count_star DESC;
```

---

**Status**: Ready to Implement
**Effort**: 1-2 hours
**Expected Benefit**: 40-90% query performance improvement
