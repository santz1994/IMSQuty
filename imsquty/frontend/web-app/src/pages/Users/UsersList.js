import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography, } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const mockUsers = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@imsquty.local',
        role: 'admin',
        status: 'active',
        lastLogin: '2026-01-06 10:30:00',
    },
    {
        id: 2,
        name: 'John Smith',
        email: 'john@imsquty.local',
        role: 'user',
        status: 'active',
        lastLogin: '2026-01-05 14:15:00',
    },
    {
        id: 3,
        name: 'Sarah Manager',
        email: 'sarah@imsquty.local',
        role: 'admin',
        status: 'active',
        lastLogin: '2026-01-04 09:45:00',
    },
];
const UsersList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState(mockUsers);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user',
        status: 'active',
    });
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const handleOpenDialog = (user) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            });
        }
        else {
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'user', status: 'active' });
        }
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
    };
    const handleSaveUser = () => {
        if (editingUser) {
            setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)));
        }
        else {
            const newUser = {
                id: Math.max(...users.map((u) => u.id), 0) + 1,
                ...formData,
                lastLogin: 'Never',
            };
            setUsers([...users, newUser]);
        }
        handleCloseDialog();
    };
    const handleDeleteUser = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter((u) => u.id !== id));
        }
    };
    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'superadmin':
                return 'error';
            case 'admin':
                return 'warning';
            case 'user':
                return 'info';
            default:
                return 'default';
        }
    };
    return (_jsx(Box, { sx: { p: 3 }, children: _jsxs(Stack, { spacing: 3, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Typography, { variant: "h4", children: "Users Management" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => handleOpenDialog(), children: "Add User" })] }), _jsx(TextField, { placeholder: "Search by name or email...", fullWidth: true, variant: "outlined", size: "small", InputProps: {
                        startAdornment: _jsx(Search, { sx: { mr: 1, color: 'gray' } }),
                    }, value: searchQuery, onChange: (e) => {
                        setSearchQuery(e.target.value);
                        setPage(0);
                    } }), _jsxs(TableContainer, { component: Paper, children: [_jsxs(Table, { children: [_jsx(TableHead, { sx: { backgroundColor: '#f5f5f5' }, children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("strong", { children: "Name" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Email" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Role" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Status" }) }), _jsx(TableCell, { children: _jsx("strong", { children: "Last Login" }) }), _jsx(TableCell, { align: "center", children: _jsx("strong", { children: "Actions" }) })] }) }), _jsx(TableBody, { children: paginatedUsers.length > 0 ? (paginatedUsers.map((user) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: user.name }), _jsx(TableCell, { children: user.email }), _jsx(TableCell, { children: _jsx(Chip, { label: user.role.toUpperCase(), color: getRoleColor(user.role), size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: user.status.toUpperCase(), color: user.status === 'active' ? 'success' : 'error', size: "small" }) }), _jsx(TableCell, { children: user.lastLogin }), _jsxs(TableCell, { align: "center", children: [_jsx(Tooltip, { title: "Edit", children: _jsx(IconButton, { size: "small", color: "info", onClick: () => handleOpenDialog(user), children: _jsx(Edit, {}) }) }), _jsx(Tooltip, { title: "Delete", children: _jsx(IconButton, { size: "small", color: "error", onClick: () => handleDeleteUser(user.id), children: _jsx(Delete, {}) }) })] })] }, user.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", sx: { py: 4 }, children: _jsx(Typography, { color: "textSecondary", children: "No users found" }) }) })) })] }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: filteredUsers.length, rowsPerPage: rowsPerPage, page: page, onPageChange: (_, newPage) => setPage(newPage), onRowsPerPageChange: (e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            } })] }), _jsxs(Dialog, { open: openDialog, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingUser ? 'Edit User' : 'Add New User' }), _jsx(DialogContent, { sx: { pt: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "Name", fullWidth: true, value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }) }), _jsx(TextField, { label: "Email", type: "email", fullWidth: true, value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }) }), _jsxs(TextField, { select: true, label: "Role", fullWidth: true, value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), SelectProps: { native: true }, children: [_jsx("option", { value: "user", children: "User" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "superadmin", children: "Superadmin" })] }), _jsxs(TextField, { select: true, label: "Status", fullWidth: true, value: formData.status, onChange: (e) => setFormData({ ...formData, status: e.target.value }), SelectProps: { native: true }, children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] })] }) }), _jsxs(DialogActions, { sx: { p: 2 }, children: [_jsx(Button, { onClick: handleCloseDialog, children: "Cancel" }), _jsx(Button, { onClick: handleSaveUser, variant: "contained", children: editingUser ? 'Update' : 'Create' })] })] })] }) }));
};
export default UsersList;
