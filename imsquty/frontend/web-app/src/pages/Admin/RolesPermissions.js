import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon, } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, CardHeader, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
/**
 * RolesPermissions Page
 * Admin-only page for RBAC (Role-Based Access Control) management
 * Features: Manage roles, assign permissions, view role hierarchy
 */
const RolesPermissions = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [],
    });
    // Load roles and permissions on mount
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            setErrorMessage('');
            // Load roles
            const rolesResponse = await axios.get('/api/v1/admin/roles');
            if (rolesResponse.data.success) {
                setRoles(rolesResponse.data.data || []);
            }
            // Load permissions
            const permissionsResponse = await axios.get('/api/v1/admin/permissions');
            if (permissionsResponse.data.success) {
                setPermissions(permissionsResponse.data.data || []);
            }
        }
        catch (error) {
            setErrorMessage('Failed to load data: ' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenDialog = (role) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description,
                permissions: role.permissions.map(p => p.id),
            });
        }
        else {
            setEditingRole(null);
            setFormData({
                name: '',
                description: '',
                permissions: [],
            });
        }
        setDialogOpen(true);
    };
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingRole(null);
        setFormData({ name: '', description: '', permissions: [] });
    };
    const handlePermissionToggle = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId],
        }));
    };
    const handleSaveRole = async () => {
        if (!formData.name.trim()) {
            setErrorMessage('Role name is required');
            return;
        }
        try {
            setSaving(true);
            setErrorMessage('');
            setSuccessMessage('');
            if (editingRole) {
                // Update existing role
                const response = await axios.put(`/api/v1/admin/roles/${editingRole.id}`, formData);
                if (response.data.success) {
                    setSuccessMessage('Role updated successfully');
                    await loadData();
                }
            }
            else {
                // Create new role
                const response = await axios.post('/api/v1/admin/roles', formData);
                if (response.data.success) {
                    setSuccessMessage('Role created successfully');
                    await loadData();
                }
            }
            handleCloseDialog();
        }
        catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to save role');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeleteRole = async (roleId) => {
        if (!window.confirm('Are you sure you want to delete this role?')) {
            return;
        }
        try {
            setSaving(true);
            setErrorMessage('');
            setSuccessMessage('');
            const response = await axios.delete(`/api/v1/admin/roles/${roleId}`);
            if (response.data.success) {
                setSuccessMessage('Role deleted successfully');
                await loadData();
            }
        }
        catch (error) {
            setErrorMessage(error.response?.data?.message || 'Failed to delete role');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx(CircularProgress, {});
    return (_jsxs(Box, { sx: { py: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsx(Typography, { variant: "h4", children: "Roles & Permissions" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenDialog(), disabled: saving, children: "New Role" })] }), successMessage && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccessMessage(''), children: successMessage })), errorMessage && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setErrorMessage(''), children: errorMessage })), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 8, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Roles" }), _jsx(Divider, {}), _jsx(CardContent, { children: _jsx(TableContainer, { children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { sx: { backgroundColor: '#f5f5f5' }, children: [_jsx(TableCell, { children: "Role Name" }), _jsx(TableCell, { children: "Description" }), _jsx(TableCell, { align: "center", children: "Permissions" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: roles.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 4, align: "center", sx: { py: 2 }, children: _jsx(Typography, { color: "textSecondary", children: "No roles found" }) }) })) : (roles.map(role => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsx(Typography, { variant: "subtitle2", children: role.name }) }), _jsx(TableCell, { children: role.description }), _jsx(TableCell, { align: "center", children: _jsx(Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: role.permissions.length }) }), _jsx(TableCell, { align: "right", children: _jsxs(Stack, { direction: "row", spacing: 1, justifyContent: "flex-end", children: [_jsx(Button, { size: "small", startIcon: _jsx(EditIcon, {}), onClick: () => handleOpenDialog(role), disabled: saving, children: "Edit" }), _jsx(Button, { size: "small", color: "error", startIcon: _jsx(DeleteIcon, {}), onClick: () => handleDeleteRole(role.id), disabled: saving, children: "Delete" })] }) })] }, role.id)))) })] }) }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsxs(Card, { children: [_jsx(CardHeader, { title: "Available Permissions" }), _jsx(Divider, {}), _jsx(CardContent, { sx: { maxHeight: '500px', overflowY: 'auto' }, children: _jsxs(Stack, { spacing: 1, children: [permissions.map(permission => (_jsxs(Typography, { variant: "body2", children: ["\u2022 ", permission.name] }, permission.id))), permissions.length === 0 && (_jsx(Typography, { color: "textSecondary", children: "No permissions available" }))] }) })] }) })] }), _jsxs(Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role' }), _jsx(Divider, {}), _jsx(DialogContent, { sx: { py: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Role Name", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), fullWidth: true, disabled: saving, placeholder: "e.g., Asset Manager, Ticket Operator" }), _jsx(TextField, { label: "Description", value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), fullWidth: true, multiline: true, rows: 2, disabled: saving, placeholder: "Brief description of this role" }), _jsx(Divider, {}), _jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 'bold' }, children: "Assign Permissions" }), _jsx(Paper, { sx: { p: 2, maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd' }, children: _jsx(Stack, { spacing: 1, children: permissions.map(permission => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: formData.permissions.includes(permission.id), onChange: () => handlePermissionToggle(permission.id), disabled: saving }), label: _jsxs(Stack, { children: [_jsx(Typography, { variant: "body2", children: permission.name }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: permission.description })] }) }, permission.id))) }) })] }) }), _jsx(Divider, {}), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: handleCloseDialog, disabled: saving, children: "Cancel" }), _jsx(Button, { variant: "contained", startIcon: _jsx(SaveIcon, {}), onClick: handleSaveRole, disabled: saving, children: saving ? 'Saving...' : 'Save Role' })] })] })] }));
};
export default RolesPermissions;
