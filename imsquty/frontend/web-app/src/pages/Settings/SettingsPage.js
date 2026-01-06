import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Switch, TextField, Typography, } from '@mui/material';
const SettingsPage = () => {
    const [settings, setSettings] = useState({
        appName: 'IMSQuty',
        appUrl: 'http://localhost:5173',
        emailNotifications: true,
        smsNotifications: false,
        twoFactorAuth: true,
        sessionTimeout: '30',
        theme: 'light',
        language: 'en',
    });
    const [openDialog, setOpenDialog] = useState(false);
    const handleChange = (key, value) => {
        setSettings({ ...settings, [key]: value });
    };
    const handleSaveSettings = () => {
        // TODO: API call to save settings
        setOpenDialog(false);
    };
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsx(Typography, { variant: "h4", children: "System Settings" }), _jsxs(Card, { children: [_jsx(CardHeader, { title: "Application Settings" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Application Name", fullWidth: true, value: settings.appName, onChange: (e) => handleChange('appName', e.target.value) }), _jsx(TextField, { label: "Application URL", fullWidth: true, value: settings.appUrl, onChange: (e) => handleChange('appUrl', e.target.value) }), _jsxs(TextField, { select: true, label: "Theme", fullWidth: true, value: settings.theme, onChange: (e) => handleChange('theme', e.target.value), SelectProps: { native: true }, children: [_jsx("option", { value: "light", children: "Light" }), _jsx("option", { value: "dark", children: "Dark" }), _jsx("option", { value: "auto", children: "Auto" })] }), _jsxs(TextField, { select: true, label: "Language", fullWidth: true, value: settings.language, onChange: (e) => handleChange('language', e.target.value), SelectProps: { native: true }, children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "id", children: "Indonesian" }), _jsx("option", { value: "es", children: "Spanish" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { title: "Security Settings" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { children: "Two-Factor Authentication" }), _jsx(Switch, { checked: settings.twoFactorAuth, onChange: (e) => handleChange('twoFactorAuth', e.target.checked) })] }), _jsx(TextField, { label: "Session Timeout (minutes)", type: "number", fullWidth: true, value: settings.sessionTimeout, onChange: (e) => handleChange('sessionTimeout', e.target.value) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { title: "Notification Settings" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsxs(Stack, { spacing: 2, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { children: "Email Notifications" }), _jsx(Switch, { checked: settings.emailNotifications, onChange: (e) => handleChange('emailNotifications', e.target.checked) })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { children: "SMS Notifications" }), _jsx(Switch, { checked: settings.smsNotifications, onChange: (e) => handleChange('smsNotifications', e.target.checked) })] })] }) })] }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Button, { variant: "contained", onClick: () => setOpenDialog(true), children: "Save Settings" }), _jsx(Button, { variant: "outlined", children: "Reset to Default" })] }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Confirm Settings" }), _jsx(DialogContent, { sx: { pt: 2 }, children: _jsx(Typography, { children: "Are you sure you want to save these settings? This may require a page reload." }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { onClick: handleSaveSettings, variant: "contained", children: "Save" })] })] })] }) }));
};
export default SettingsPage;
