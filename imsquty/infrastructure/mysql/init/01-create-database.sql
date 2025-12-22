-- ===========================================
-- IMSQuty Microservices - Database Initialization
-- Database: imstest_quty (Shared Database Strategy)
-- ===========================================
-- Create database if not exists (already created by docker-compose)
CREATE DATABASE IF NOT EXISTS imstest_quty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE imstest_quty;
-- ===========================================
-- AUDIT LOGGING TABLE (Used by all services)
-- ===========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    service_name VARCHAR(50) NOT NULL COMMENT 'Which microservice created this log',
    action VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, etc',
    resource_type VARCHAR(100) NOT NULL COMMENT 'Model name: Ticket, Asset, User, etc',
    resource_id BIGINT UNSIGNED NULL COMMENT 'ID of the affected resource',
    old_values JSON NULL COMMENT 'Previous values before change',
    new_values JSON NULL COMMENT 'New values after change',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_service_name (service_name),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
) ENGINE = InnoDB COMMENT = 'Audit logs for compliance (ISO 27001, GDPR, SOC 2)';
-- ===========================================
-- USERS & AUTHENTICATION (Auth Service + User Service)
-- ===========================================
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    avatar VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    password_changed_at TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_status (status),
    INDEX idx_deleted_at (deleted_at)
) ENGINE = InnoDB;
-- JWT tokens blacklist
CREATE TABLE IF NOT EXISTS jwt_blacklist (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB;
-- Login history
CREATE TABLE IF NOT EXISTS login_history (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    status ENUM('success', 'failed') NOT NULL,
    failure_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB;
-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token)
) ENGINE = InnoDB;
-- ===========================================
-- ROLES & PERMISSIONS (User Service - Spatie)
-- ===========================================
-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    guard_name VARCHAR(255) DEFAULT 'api',
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) DEFAULT 'api',
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_permission (name, guard_name)
) ENGINE = InnoDB;
-- Role has permissions
CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE = InnoDB;
-- Model has roles
CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, model_type, model_id),
    INDEX idx_model (model_type, model_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE = InnoDB;
-- Model has permissions
CREATE TABLE IF NOT EXISTS model_has_permissions (
    permission_id BIGINT UNSIGNED NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (permission_id, model_type, model_id),
    INDEX idx_model (model_type, model_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE = InnoDB;
-- ===========================================
-- MASTER DATA (Master Data Service)
-- ===========================================
-- Locations/Sites
CREATE TABLE IF NOT EXISTS locations (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    country VARCHAR(100) DEFAULT 'Indonesia',
    postal_code VARCHAR(20) NULL,
    phone VARCHAR(20) NULL,
    parent_id BIGINT UNSIGNED NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Divisions/Departments
CREATE TABLE IF NOT EXISTS divisions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    parent_id BIGINT UNSIGNED NULL,
    manager_id BIGINT UNSIGNED NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id),
    INDEX idx_manager_id (manager_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (parent_id) REFERENCES divisions(id) ON DELETE
    SET NULL,
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Manufacturers
CREATE TABLE IF NOT EXISTS manufacturers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NULL,
    website VARCHAR(255) NULL,
    support_email VARCHAR(255) NULL,
    support_phone VARCHAR(20) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
) ENGINE = InnoDB;
-- Suppliers/Vendors
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    country VARCHAR(100) DEFAULT 'Indonesia',
    tax_id VARCHAR(50) NULL COMMENT 'NPWP',
    payment_terms VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
) ENGINE = InnoDB;
-- ===========================================
-- ASSET MANAGEMENT (Asset Service)
-- ===========================================
-- Asset Types/Categories
CREATE TABLE IF NOT EXISTS asset_types (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    parent_id BIGINT UNSIGNED NULL,
    depreciation_rate DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'Annual depreciation %',
    useful_life_years INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id),
    FOREIGN KEY (parent_id) REFERENCES asset_types(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Asset Models
CREATE TABLE IF NOT EXISTS asset_models (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    model_number VARCHAR(100) NULL,
    manufacturer_id BIGINT UNSIGNED NULL,
    asset_type_id BIGINT UNSIGNED NOT NULL,
    description TEXT NULL,
    specifications JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_manufacturer_id (manufacturer_id),
    INDEX idx_asset_type_id (asset_type_id),
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE
    SET NULL,
        FOREIGN KEY (asset_type_id) REFERENCES asset_types(id) ON DELETE RESTRICT
) ENGINE = InnoDB;
-- Asset Status
CREATE TABLE IF NOT EXISTS asset_statuses (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6c757d',
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
-- Assets
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    asset_tag VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique identifier/barcode',
    name VARCHAR(255) NOT NULL,
    asset_model_id BIGINT UNSIGNED NULL,
    asset_type_id BIGINT UNSIGNED NOT NULL,
    serial_number VARCHAR(255) NULL,
    status_id BIGINT UNSIGNED NOT NULL,
    location_id BIGINT UNSIGNED NULL,
    assigned_to BIGINT UNSIGNED NULL COMMENT 'User ID',
    division_id BIGINT UNSIGNED NULL,
    -- Purchase Information
    purchase_date DATE NULL,
    purchase_cost DECIMAL(15, 2) DEFAULT 0.00,
    supplier_id BIGINT UNSIGNED NULL,
    invoice_number VARCHAR(100) NULL,
    -- Warranty Information
    warranty_months INT DEFAULT 0,
    warranty_expires_at DATE NULL,
    -- Depreciation
    depreciation_rate DECIMAL(5, 2) DEFAULT 0.00,
    current_value DECIMAL(15, 2) DEFAULT 0.00,
    -- Additional Info
    notes TEXT NULL,
    qr_code VARCHAR(255) NULL,
    image VARCHAR(255) NULL,
    specifications JSON NULL,
    -- Timestamps
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_asset_tag (asset_tag),
    INDEX idx_serial_number (serial_number),
    INDEX idx_status_id (status_id),
    INDEX idx_location_id (location_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_division_id (division_id),
    INDEX idx_asset_model_id (asset_model_id),
    INDEX idx_asset_type_id (asset_type_id),
    FOREIGN KEY (asset_model_id) REFERENCES asset_models(id) ON DELETE
    SET NULL,
        FOREIGN KEY (asset_type_id) REFERENCES asset_types(id) ON DELETE RESTRICT,
        FOREIGN KEY (status_id) REFERENCES asset_statuses(id) ON DELETE RESTRICT,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE
    SET NULL,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE
    SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Asset Movements/Transfers
CREATE TABLE IF NOT EXISTS asset_movements (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    asset_id BIGINT UNSIGNED NOT NULL,
    movement_type ENUM(
        'assignment',
        'transfer',
        'return',
        'maintenance',
        'disposal'
    ) NOT NULL,
    from_user_id BIGINT UNSIGNED NULL,
    to_user_id BIGINT UNSIGNED NULL,
    from_location_id BIGINT UNSIGNED NULL,
    to_location_id BIGINT UNSIGNED NULL,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_asset_id (asset_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_movement_date (movement_date),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Asset Maintenance Logs
CREATE TABLE IF NOT EXISTS asset_maintenance_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    asset_id BIGINT UNSIGNED NOT NULL,
    maintenance_type ENUM(
        'preventive',
        'corrective',
        'inspection',
        'calibration'
    ) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    scheduled_date DATE NULL,
    completed_date DATE NULL,
    cost DECIMAL(15, 2) DEFAULT 0.00,
    supplier_id BIGINT UNSIGNED NULL,
    technician_id BIGINT UNSIGNED NULL,
    status ENUM(
        'scheduled',
        'in_progress',
        'completed',
        'cancelled'
    ) DEFAULT 'scheduled',
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asset_id (asset_id),
    INDEX idx_maintenance_type (maintenance_type),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE
    SET NULL,
        FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- ===========================================
-- TICKETING SYSTEM (Ticket Service)
-- ===========================================
-- Ticket Priorities
CREATE TABLE IF NOT EXISTS ticket_priorities (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE NOT NULL,
    level INT NOT NULL COMMENT '1=Critical, 2=High, 3=Medium, 4=Low',
    color VARCHAR(7) DEFAULT '#6c757d',
    sla_hours INT DEFAULT 24 COMMENT 'Response SLA in hours',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
-- Ticket Types/Categories
CREATE TABLE IF NOT EXISTS ticket_types (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    parent_id BIGINT UNSIGNED NULL,
    default_priority_id BIGINT UNSIGNED NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id),
    FOREIGN KEY (parent_id) REFERENCES ticket_types(id) ON DELETE
    SET NULL,
        FOREIGN KEY (default_priority_id) REFERENCES ticket_priorities(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Ticket Status
CREATE TABLE IF NOT EXISTS ticket_statuses (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6c757d',
    description TEXT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;
-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ticket_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'e.g., TKT-2025-00001',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    -- Classification
    ticket_type_id BIGINT UNSIGNED NOT NULL,
    priority_id BIGINT UNSIGNED NOT NULL,
    status_id BIGINT UNSIGNED NOT NULL,
    -- Assignment
    requester_id BIGINT UNSIGNED NOT NULL COMMENT 'User who created the ticket',
    assigned_to BIGINT UNSIGNED NULL COMMENT 'Technician assigned',
    division_id BIGINT UNSIGNED NULL,
    location_id BIGINT UNSIGNED NULL,
    -- Related Asset (optional)
    asset_id BIGINT UNSIGNED NULL,
    -- SLA Tracking
    sla_breach_at TIMESTAMP NULL COMMENT 'When SLA will be breached',
    is_sla_breached BOOLEAN DEFAULT FALSE,
    -- Timestamps
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    first_response_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    -- Resolution
    resolution TEXT NULL,
    resolution_category VARCHAR(100) NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_requester_id (requester_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status_id (status_id),
    INDEX idx_priority_id (priority_id),
    INDEX idx_ticket_type_id (ticket_type_id),
    INDEX idx_created_at (created_at),
    INDEX idx_sla_breach_at (sla_breach_at),
    FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (priority_id) REFERENCES ticket_priorities(id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES ticket_statuses(id) ON DELETE RESTRICT,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE
    SET NULL,
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE
    SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Ticket Comments
CREATE TABLE IF NOT EXISTS ticket_comments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE COMMENT 'Internal note, not visible to requester',
    attachments JSON NULL COMMENT 'Array of file paths',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE = InnoDB;
-- Ticket History/Activity Log
CREATE TABLE IF NOT EXISTS ticket_histories (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL COMMENT 'created, assigned, updated, closed, etc',
    field_name VARCHAR(100) NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- ===========================================
-- INVENTORY MANAGEMENT (Inventory Service)
-- ===========================================
-- Inventory Items (Spare Parts, Consumables)
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NULL,
    unit_of_measure VARCHAR(50) DEFAULT 'pcs',
    -- Stock
    quantity_on_hand INT DEFAULT 0,
    reorder_level INT DEFAULT 0,
    reorder_quantity INT DEFAULT 0,
    -- Pricing
    unit_cost DECIMAL(15, 2) DEFAULT 0.00,
    -- Location
    location_id BIGINT UNSIGNED NULL,
    warehouse_location VARCHAR(255) NULL COMMENT 'Shelf/Bin location',
    -- Supplier
    supplier_id BIGINT UNSIGNED NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_item_code (item_code),
    INDEX idx_category (category),
    INDEX idx_location_id (location_id),
    INDEX idx_supplier_id (supplier_id),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Inventory Transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    inventory_item_id BIGINT UNSIGNED NOT NULL,
    transaction_type ENUM('in', 'out', 'adjustment', 'transfer') NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(15, 2) DEFAULT 0.00,
    -- Reference
    reference_type VARCHAR(100) NULL COMMENT 'PurchaseOrder, Asset, Ticket, etc',
    reference_id BIGINT UNSIGNED NULL,
    -- Location
    from_location_id BIGINT UNSIGNED NULL,
    to_location_id BIGINT UNSIGNED NULL,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inventory_item_id (inventory_item_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference_type, reference_id),
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT,
    FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE
    SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- ===========================================
-- FINANCIAL MANAGEMENT (Financial Service)
-- ===========================================
-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    fiscal_year INT NOT NULL,
    division_id BIGINT UNSIGNED NULL,
    category VARCHAR(100) NOT NULL COMMENT 'CAPEX, OPEX, etc',
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    committed_amount DECIMAL(15, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('draft', 'approved', 'active', 'closed') DEFAULT 'draft',
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_fiscal_year (fiscal_year),
    INDEX idx_division_id (division_id),
    INDEX idx_status (status),
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE
    SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    division_id BIGINT UNSIGNED NULL,
    budget_id BIGINT UNSIGNED NULL,
    po_date DATE NOT NULL,
    expected_delivery_date DATE NULL,
    delivery_date DATE NULL,
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM(
        'draft',
        'pending_approval',
        'approved',
        'rejected',
        'sent',
        'received',
        'cancelled'
    ) DEFAULT 'draft',
    notes TEXT NULL,
    terms_and_conditions TEXT NULL,
    requested_by BIGINT UNSIGNED NULL,
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_po_number (po_number),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_status (status),
    INDEX idx_po_date (po_date),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE
    SET NULL,
        FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE
    SET NULL,
        FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE
    SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Purchase Order Line Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id BIGINT UNSIGNED NOT NULL,
    description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    -- Link to inventory or asset
    inventory_item_id BIGINT UNSIGNED NULL,
    asset_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_purchase_order_id (purchase_order_id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE
    SET NULL,
        FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    purchase_order_id BIGINT UNSIGNED NULL,
    supplier_id BIGINT UNSIGNED NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) DEFAULT 0.00,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM(
        'pending',
        'partial',
        'paid',
        'overdue',
        'cancelled'
    ) DEFAULT 'pending',
    notes TEXT NULL,
    attachment VARCHAR(255) NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE
    SET NULL,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- ===========================================
-- MEETING ROOM MANAGEMENT (Meeting Room Service)
-- ===========================================
-- Meeting Rooms
CREATE TABLE IF NOT EXISTS meeting_rooms (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location_id BIGINT UNSIGNED NOT NULL,
    floor VARCHAR(50) NULL,
    capacity INT NOT NULL,
    -- Amenities/Facilities
    has_projector BOOLEAN DEFAULT FALSE,
    has_tv BOOLEAN DEFAULT FALSE,
    has_whiteboard BOOLEAN DEFAULT FALSE,
    has_video_conference BOOLEAN DEFAULT FALSE,
    amenities JSON NULL COMMENT 'Additional amenities list',
    description TEXT NULL,
    image VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_code (code),
    INDEX idx_location_id (location_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
) ENGINE = InnoDB;
-- Meeting Room Bookings
CREATE TABLE IF NOT EXISTS meeting_room_bookings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    meeting_room_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    -- Booking user
    booked_by BIGINT UNSIGNED NOT NULL,
    division_id BIGINT UNSIGNED NULL,
    -- Approval workflow
    status ENUM(
        'pending',
        'approved',
        'rejected',
        'confirmed',
        'completed',
        'cancelled'
    ) DEFAULT 'pending',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    -- Attendance
    expected_attendees INT DEFAULT 0,
    actual_attendees INT NULL,
    -- Check-in/out
    checked_in_at TIMESTAMP NULL,
    checked_out_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_booking_number (booking_number),
    INDEX idx_meeting_room_id (meeting_room_id),
    INDEX idx_booked_by (booked_by),
    INDEX idx_status (status),
    INDEX idx_start_datetime (start_datetime),
    INDEX idx_datetime_range (start_datetime, end_datetime),
    FOREIGN KEY (meeting_room_id) REFERENCES meeting_rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (booked_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE
    SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE
    SET NULL
) ENGINE = InnoDB;
-- ===========================================
-- NOTIFICATIONS (Notification Service)
-- ===========================================
-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(100) NOT NULL COMMENT 'ticket_assigned, sla_breach, asset_assigned, etc',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    -- Reference to source
    resource_type VARCHAR(100) NULL COMMENT 'Ticket, Asset, Booking, etc',
    resource_id BIGINT UNSIGNED NULL,
    -- Delivery channels
    sent_via_email BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    sent_via_push BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP NULL,
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_resource (resource_type, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB;
-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    -- Email preferences
    email_ticket_assigned BOOLEAN DEFAULT TRUE,
    email_ticket_updated BOOLEAN DEFAULT TRUE,
    email_sla_breach BOOLEAN DEFAULT TRUE,
    email_asset_assigned BOOLEAN DEFAULT TRUE,
    email_booking_approved BOOLEAN DEFAULT TRUE,
    -- In-app preferences
    app_ticket_assigned BOOLEAN DEFAULT TRUE,
    app_ticket_updated BOOLEAN DEFAULT TRUE,
    app_sla_breach BOOLEAN DEFAULT TRUE,
    app_asset_assigned BOOLEAN DEFAULT TRUE,
    app_booking_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE = InnoDB;
-- ===========================================
-- SEED DEFAULT DATA
-- ===========================================
-- Insert default roles
INSERT INTO roles (name, guard_name, description)
VALUES ('Super Admin', 'api', 'Full system access'),
    ('Admin', 'api', 'Administrative access'),
    ('Manager', 'api', 'Department manager access'),
    ('Technician', 'api', 'Technical staff access'),
    ('User', 'api', 'Standard user access');
-- Insert default asset statuses
INSERT INTO asset_statuses (name, code, color, description, sort_order)
VALUES (
        'Available',
        'AVAILABLE',
        '#28a745',
        'Asset is available for assignment',
        1
    ),
    (
        'Assigned',
        'ASSIGNED',
        '#007bff',
        'Asset is assigned to a user',
        2
    ),
    (
        'In Maintenance',
        'MAINTENANCE',
        '#ffc107',
        'Asset is under maintenance',
        3
    ),
    (
        'In Repair',
        'REPAIR',
        '#fd7e14',
        'Asset is being repaired',
        4
    ),
    (
        'Retired',
        'RETIRED',
        '#6c757d',
        'Asset is retired/decommissioned',
        5
    ),
    ('Lost', 'LOST', '#dc3545', 'Asset is lost', 6),
    (
        'Disposed',
        'DISPOSED',
        '#343a40',
        'Asset has been disposed',
        7
    );
-- Insert default ticket priorities
INSERT INTO ticket_priorities (name, code, level, color, sla_hours, sort_order)
VALUES ('Critical', 'CRITICAL', 1, '#dc3545', 2, 1),
    ('High', 'HIGH', 2, '#fd7e14', 4, 2),
    ('Medium', 'MEDIUM', 3, '#ffc107', 24, 3),
    ('Low', 'LOW', 4, '#28a745', 72, 4);
-- Insert default ticket statuses
INSERT INTO ticket_statuses (name, code, color, is_closed, sort_order)
VALUES ('Open', 'OPEN', '#007bff', FALSE, 1),
    (
        'In Progress',
        'IN_PROGRESS',
        '#ffc107',
        FALSE,
        2
    ),
    (
        'Pending User',
        'PENDING_USER',
        '#17a2b8',
        FALSE,
        3
    ),
    ('Resolved', 'RESOLVED', '#28a745', FALSE, 4),
    ('Closed', 'CLOSED', '#6c757d', TRUE, 5),
    ('Cancelled', 'CANCELLED', '#dc3545', TRUE, 6);
-- Insert default admin user (password: 123456)
INSERT INTO users (
        username,
        email,
        password,
        first_name,
        last_name,
        status,
        email_verified_at
    )
VALUES (
        'admin',
        'admin@quty.co.id',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'System',
        'Administrator',
        'active',
        NOW()
    );
-- Assign Super Admin role to admin user
INSERT INTO model_has_roles (role_id, model_type, model_id)
VALUES (1, 'App\\Models\\User', 1);
-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
-- Composite indexes for common queries
CREATE INDEX idx_tickets_assigned_status ON tickets(assigned_to, status_id);
CREATE INDEX idx_tickets_requester_status ON tickets(requester_id, status_id);
CREATE INDEX idx_assets_location_status ON assets(location_id, status_id);
CREATE INDEX idx_assets_assigned_status ON assets(assigned_to, status_id);
-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================
SELECT 'Database imstest_quty initialized successfully!' AS message;