import React from 'react';
interface SystemSettings {
    app_name: string;
    app_version: string;
    app_url: string;
    app_timezone: string;
    app_locale: string;
    max_upload_size: number;
    session_timeout: number;
    enable_2fa: boolean;
    enable_audit_logging: boolean;
    enable_api_throttling: boolean;
    api_throttle_rate: number;
    backup_enabled: boolean;
    backup_frequency: string;
    maintenance_mode: boolean;
    maintenance_message: string;
}
/**
 * SystemSettings Page
 * Admin-only page for system configuration and settings
 * Features: General settings, Security settings, Backup settings, Maintenance mode
 */
declare const SystemSettings: React.FC;
export default SystemSettings;
