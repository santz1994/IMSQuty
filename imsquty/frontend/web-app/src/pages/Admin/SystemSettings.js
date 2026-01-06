import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Save as SaveIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, CardHeader, CircularProgress, Divider, FormControlLabel, Grid, Stack, Switch, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FormField, FormGroup } from '../../components/FormField';
import { useAppDispatch } from '../../store/hooks';
/**
 * SystemSettings Page
 * Admin-only page for system configuration and settings
 * Features: General settings, Security settings, Backup settings, Maintenance mode
 */
const SystemSettings = () => {
    const dispatch = useAppDispatch();
    const [settings, setSettings] = useState({
        app_name: 'imsquty',
        app_version: '1.0.0',
        app_url: 'http://localhost:8000',
        app_timezone: 'UTC',
        app_locale: 'en-US',
        max_upload_size: 10,
        session_timeout: 30,
        enable_2fa: false,
        enable_audit_logging: true,
        enable_api_throttling: true,
        api_throttle_rate: 60,
        backup_enabled: true,
        backup_frequency: 'daily',
        maintenance_mode: false,
        maintenance_message: '',
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);
    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/settings');
            if (response.data.success) {
                setSettings(response.data.data);
            }
        }
        catch (error) {
            setErrorMessage('Failed to load settings: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    };
    const handleSave = async () => {
        try {
            setSaving(true);
            setErrorMessage('');
            setSuccessMessage('');
            const response = await axios.post('/api/v1/admin/settings', settings);
            if (response.data.success) {
                setSuccessMessage('Settings saved successfully');
                // Reload settings from server
                await loadSettings();
            }
        }
        catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to save settings');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx(CircularProgress, {});
    return (_jsxs(Box, { sx: { py: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { mb: 3 }, children: "System Settings" }), successMessage && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccessMessage(''), children: successMessage })), errorMessage && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setErrorMessage(''), children: errorMessage })), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "General Settings" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(FormGroup, { spacing: 2, children: [_jsx(FormField, { label: "Application Name", value: settings.app_name, onChange: (e) => handleSettingChange('app_name', e.target.value), disabled: saving }), _jsx(FormField, { label: "Application Version", value: settings.app_version, onChange: (e) => handleSettingChange('app_version', e.target.value), disabled: saving }), _jsx(FormField, { label: "Application URL", value: settings.app_url, onChange: (e) => handleSettingChange('app_url', e.target.value), disabled: saving }), _jsx(FormField, { label: "Timezone", value: settings.app_timezone, onChange: (e) => handleSettingChange('app_timezone', e.target.value), disabled: saving }), _jsx(FormField, { label: "Locale", value: settings.app_locale, onChange: (e) => handleSettingChange('app_locale', e.target.value), disabled: saving })] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Security Settings" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(FormGroup, { spacing: 2, children: [_jsx(FormField, { label: "Max Upload Size (MB)", type: "number", value: settings.max_upload_size, onChange: (e) => handleSettingChange('max_upload_size', Number(e.target.value)), disabled: saving }), _jsx(FormField, { label: "Session Timeout (minutes)", type: "number", value: settings.session_timeout, onChange: (e) => handleSettingChange('session_timeout', Number(e.target.value)), disabled: saving }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: settings.enable_2fa, onChange: (e) => handleSettingChange('enable_2fa', e.target.checked), disabled: saving }), label: "Enable Two-Factor Authentication" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: settings.enable_audit_logging, onChange: (e) => handleSettingChange('enable_audit_logging', e.target.checked), disabled: saving }), label: "Enable Audit Logging" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: settings.enable_api_throttling, onChange: (e) => handleSettingChange('enable_api_throttling', e.target.checked), disabled: saving }), label: "Enable API Throttling" }), settings.enable_api_throttling && (_jsx(FormField, { label: "API Throttle Rate (requests/minute)", type: "number", value: settings.api_throttle_rate, onChange: (e) => handleSettingChange('api_throttle_rate', Number(e.target.value)), disabled: saving }))] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Backup Settings" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(FormGroup, { spacing: 2, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: settings.backup_enabled, onChange: (e) => handleSettingChange('backup_enabled', e.target.checked), disabled: saving }), label: "Enable Backups" }), settings.backup_enabled && (_jsx(FormField, { label: "Backup Frequency", value: settings.backup_frequency, onChange: (e) => handleSettingChange('backup_frequency', e.target.value), disabled: saving, helperText: "daily, weekly, or monthly" }))] }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Maintenance Mode" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(FormGroup, { spacing: 2, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: settings.maintenance_mode, onChange: (e) => handleSettingChange('maintenance_mode', e.target.checked), disabled: saving }), label: "Enable Maintenance Mode" }), settings.maintenance_mode && (_jsx(TextField, { label: "Maintenance Message", value: settings.maintenance_message, onChange: (e) => handleSettingChange('maintenance_message', e.target.value), disabled: saving, multiline: true, rows: 3, fullWidth: true, helperText: "Message shown to users during maintenance" }))] }) })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Stack, { direction: "row", spacing: 2, children: [_jsx(Button, { variant: "contained", startIcon: _jsx(SaveIcon, {}), onClick: handleSave, disabled: saving, children: saving ? 'Saving...' : 'Save Settings' }), _jsx(Button, { variant: "outlined", onClick: loadSettings, disabled: saving, children: "Reload" })] }) })] })] }));
};
export default SystemSettings;
